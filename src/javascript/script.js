document.addEventListener('DOMContentLoaded', function () {

    /* =============================================================
       MENU MOBILE
       ============================================================= */
    const header = document.getElementById('header');
    const mobileBtn = document.querySelector('.btn-mobile');
    const navLinks = document.getElementById('nav-links');
    const mobileIcon = mobileBtn.querySelector('i');

    function setMenu(open) {
        navLinks.classList.toggle('show', open);
        mobileBtn.setAttribute('aria-expanded', String(open));
        mobileBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        mobileIcon.classList.toggle('fa-times', open);
        mobileIcon.classList.toggle('fa-bars', !open);
    }

    mobileBtn.addEventListener('click', () => {
        setMenu(!navLinks.classList.contains('show'));
    });

    // Fecha o menu ao escolher um destino ou apertar Esc
    navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('show')) {
            setMenu(false);
            mobileBtn.focus();
        }
    });

    /* =============================================================
       LINK ATIVO + HEADER AO ROLAR
       Um único handler de scroll, agendado por requestAnimationFrame.
       ============================================================= */
    const navAnchors = Array.from(document.querySelectorAll('#nav-links a'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    function setActiveMenuItem(sectionId) {
        navAnchors.forEach(link => {
            const isActive = link.getAttribute('href') === '#' + sectionId;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 40);

        // A seção ativa é a última cujo topo já passou de 35% da viewport.
        const line = window.scrollY + window.innerHeight * 0.35;
        let current = sections[0];
        for (const section of sections) {
            if (section.offsetTop <= line) current = section;
        }
        if (current) setActiveMenuItem(current.id);
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            onScroll();
            ticking = false;
        });
    }, { passive: true });

    onScroll();

    /* =============================================================
       ENTRADA DOS ELEMENTOS
       Um só gesto: sobe, desfoca e assenta. Tudo que entra na tela
       é revelado uma vez e nunca mais escondido.
       ============================================================= */
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));

    function revealAll() {
        revealTargets.forEach(el => el.classList.add('revealed'));
    }

    if (!('IntersectionObserver' in window)) {
        revealAll();
    } else {
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

        revealTargets.forEach(el => revealObserver.observe(el));

        // Rede de segurança: nada fica invisível por falha do observer.
        setTimeout(revealAll, 3000);
    }

    /* =============================================================
       CARROSSEL DA HERO
       As miniaturas e as setas trocam o copo e o nome vertical.
       ============================================================= */
    const heroSlides = [
        { img: 'src/images/products/7.png', nome: 'Tropical', alt: 'Refresco tropical gelado com chantilly' },
        { img: 'src/images/products/1.png', nome: 'Chocolate', alt: 'Bebida gelada de chocolate com chantilly e raspas' },
        { img: 'src/images/products/4.png', nome: 'Manga', alt: 'Bebida gelada de manga com chantilly e calda' },
        { img: 'src/images/products/5.png', nome: 'Matcha', alt: 'Bebida gelada de matcha com chantilly' },
        { img: 'src/images/products/2.png', nome: 'Morango', alt: 'Bebida gelada de morango com chantilly' }
    ];

    const heroImage = document.querySelector('.home-image');
    const heroThumbs = Array.from(document.querySelectorAll('.hero-thumb'));
    const heroWords = Array.from(document.querySelectorAll('.hero-word span'));
    const heroStatus = document.querySelector('[role="status"]');
    const heroFav = document.querySelector('.hero-fav');
    let heroIndex = 0;

    function showSlide(index) {
        heroIndex = (index + heroSlides.length) % heroSlides.length;
        const slide = heroSlides[heroIndex];

        heroImage.src = slide.img;
        heroImage.alt = slide.alt;
        heroWords.forEach(word => { word.textContent = slide.nome; });
        heroThumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === heroIndex));

        // trocar de bebida zera o favorito — ele pertence à bebida, não ao botão
        heroFav.setAttribute('aria-pressed', 'false');
        heroFav.setAttribute('aria-label', `Salvar ${slide.nome} nos favoritos`);

        heroStatus.textContent = slide.nome;

        // reinicia a entrada do copo para dar peso à troca
        heroImage.classList.remove('is-swapping');
        void heroImage.offsetWidth;
        heroImage.classList.add('is-swapping');
    }

    if (heroImage && heroThumbs.length) {
        heroThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => showSlide(Number(thumb.dataset.slide)));
        });

        document.querySelectorAll('.hero-arrow').forEach(arrow => {
            arrow.addEventListener('click', () => showSlide(heroIndex + Number(arrow.dataset.dir)));
        });

        heroFav.addEventListener('click', () => {
            const on = heroFav.getAttribute('aria-pressed') === 'true';
            heroFav.setAttribute('aria-pressed', String(!on));
        });
    }

    /* =============================================================
       FILTRO DO MENU
       ============================================================= */
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const productCards = Array.from(document.querySelectorAll('.product-card'));
    const emptyState = document.querySelector('.products-empty');

    function applyFilter(value) {
        let visible = 0;

        productCards.forEach(card => {
            const match = value === 'all' || card.dataset.category === value;
            card.hidden = !match;
            if (match) {
                card.classList.add('revealed');
                visible++;
            }
        });

        filterButtons.forEach(button => {
            const isOn = button.dataset.filter === value;
            button.classList.toggle('active', isOn);
            button.setAttribute('aria-pressed', String(isOn));
        });

        if (emptyState) emptyState.hidden = visible > 0;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => applyFilter(button.dataset.filter));
    });

    const emptyReset = document.querySelector('.products-empty .link-btn');
    if (emptyReset) {
        emptyReset.addEventListener('click', () => {
            applyFilter('all');
            document.querySelector('.menu-filters .filter-btn').focus();
        });
    }
});
