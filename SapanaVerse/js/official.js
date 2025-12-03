    // Glass slide-in
    const glasses = document.querySelectorAll('.glass');
    const panels  = document.querySelectorAll('.panel');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // card animation
                const glass = entry.target.querySelector('.glass');
                if (glass) glass.classList.add('visible');

                // mark panel active to trigger bot direction animation
                entry.target.classList.add('panel-active');

                // show bot smoothly
                const bot = entry.target.querySelector('.bot-orb');
                if (bot) {
                    bot.classList.add('floating');
                }
            }
        });
    }, {
        threshold: 0.45
    });

    panels.forEach(panel => observer.observe(panel));