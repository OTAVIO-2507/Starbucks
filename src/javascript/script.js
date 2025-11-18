document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos da navegação
    const mobileBtn = document.querySelector('.btn-mobile');
    const navLinks = document.getElementById('nav-links');
    const navLinks_a = document.querySelectorAll('#nav-links a');
    const icon = document.querySelector('.btn-mobile i');

    let isScrolling = false; // Flag para evitar que o menu active mude durante a rolagem suave

    // Menu mobile: Abre/fecha a lista de links e troca o ícone
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        icon.classList.toggle('fa-times'); // Ícone de fechar (X)
        icon.classList.toggle('fa-bars'); // Ícone sanduíche
    });

    // Função para ativar visualmente o item do menu correspondente à seção
    function setActiveMenuItem(sectionId) {
        // Remove a classe 'active' de todos os links
        navLinks_a.forEach(link => {
            link.classList.remove('active');
        });

        // Adiciona a classe 'active' ao link que corresponde ao ID da seção
        const activeLink = document.querySelector(`#nav-links a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Função para lidar com cliques em links internos (rolagem suave)
    function handleNavClick(e) {
        e.preventDefault();

        const href = this.getAttribute('href'); // Obtém o hash (ex: "#home")
        const targetId = href.substring(1);     // Obtém o ID (ex: "home")
        const targetElement = document.getElementById(targetId);

        if (!targetElement) return;

        // Verifica a flag para evitar conflito durante a animação de scroll
        if (!isScrolling) {
            isScrolling = true;

            // Rola suavemente para a seção
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Atualiza o item ativo do menu imediatamente
            setActiveMenuItem(targetId);

            // Reseta a flag após a rolagem (duração aproximada da animação)
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }

    // Seleciona todos os links internos (tanto na lista de navegação quanto no logo)
    const internalLinks = document.querySelectorAll(
        '#nav-links a, #header a[href^="#"]:not([href="#"])'
    );

    // Adiciona o listener de clique a todos os links internos
    internalLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // IntersectionObserver para ativar o menu ao rolar
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Se a seção estiver visível e não estivermos rolando via clique:
            if (entry.isIntersecting && !isScrolling) {
                setActiveMenuItem(entry.target.id);
            }
        });
    }, {
        threshold: 0.5 // Ativa quando 50% da seção está visível
    });

    // Observa todas as seções para a mudança de menu
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // IntersectionObserver para o efeito de surgimento (Adiciona a classe 'visible')
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Faz a seção aparecer
            } else {
                entry.target.classList.remove('visible'); // Opcional: faz desaparecer ao sair (para repetição de animação)
            }
        });
    }, {
        threshold: 0.3, // Ativa quando 30% da seção entra na viewport
    });

    // Observa todas as seções para o efeito de surgimento
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // OBS: O bloco de código abaixo sobre novidades ('novidadeObserver') parece ser redundante com o 'sectionObserver' acima.
    // Ele foi mantido aqui, mas em um projeto real, você usaria apenas o 'sectionObserver' para todas as seções.
    const novidadesSection = document.querySelector('#products');

    const novidadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                novidadesSection.classList.add('visible');
            } else {
                novidadesSection.classList.remove('visible');
            }
        });
    }, {
        threshold: 1.0,  // Ativa quando 100% da seção está visível
    });

    // novidadeObserver.observe(novidadesSection); // Linha comentada pois já é observada pelo sectionObserver
});