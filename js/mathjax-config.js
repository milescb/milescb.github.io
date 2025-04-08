window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    },
    startup: {
        pageReady() {
            return MathJax.startup.defaultPageReady().then(() => {
                // Make MathJax respond to theme changes
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.attributeName === 'class' && 
                            (mutation.target.classList.contains('light-theme') || 
                            mutation.target.classList.contains('dark-theme'))) {
                            MathJax.typeset();
                        }
                    }
                });
                observer.observe(document.documentElement, { attributes: true });
            });
        }
    }
};