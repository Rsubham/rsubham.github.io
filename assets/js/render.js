import { certifications, education, experience, projects, stackGroups } from './data.js?v=20260518-tilt6';

const createElement = (tag, options = {}) => {
    const element = document.createElement(tag);

    if (options.className) element.className = options.className;
    if (options.text) element.textContent = options.text;
    if (options.html) element.innerHTML = options.html;
    if (options.attrs) {
        Object.entries(options.attrs).forEach(([key, value]) => {
            if (value !== undefined && value !== null) element.setAttribute(key, value);
        });
    }

    return element;
};

const applyAnimation = (element, type, delay) => {
    element.dataset.animate = type;
    if (delay !== undefined) element.dataset.delay = String(delay);
    return element;
};

const renderStackGroups = () => {
    const mount = document.querySelector('[data-tech-panel]');
    if (!mount) return;

    stackGroups.forEach((group, index) => {
        const column = createElement('section', { className: 'tech-panel__column' });
        const title = applyAnimation(createElement('h4', { className: 'tech-panel__title', text: group.title }), 'blur-in', index * 0.15);
        const list = createElement('ul', { className: 'tech-list' });

        group.items.forEach((item, itemIndex) => {
            list.append(applyAnimation(createElement('li', { text: item }), 'pop-in', itemIndex * 0.06));
        });

        column.append(title, list);
        mount.append(column);
    });
};

const renderProjects = () => {
    const mount = document.querySelector('[data-projects]');
    if (!mount) return;

    projects.forEach((project, index) => {
        const article = applyAnimation(createElement('article', {
            className: 'project-card liquid-glass',
            attrs: { 'data-tilt': '' },
        }), 'fade-up', index * 0.15);
        const header = createElement('header', { className: 'project-card__header' });
        const identity = createElement('div');
        const title = applyAnimation(createElement('h3', { className: 'project-card__title', text: project.name }), 'blur-in');
        const type = applyAnimation(createElement('p', { className: 'project-card__type', text: project.type }), 'fade-in', 0.1);
        const link = applyAnimation(createElement('a', {
            className: 'project-card__link',
            text: 'Live \u2197',
            attrs: {
                href: project.url,
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-label': `Open ${project.name} live site`,
            },
        }), 'fade-in', 0.15);
        const summary = applyAnimation(createElement('p', { className: 'project-card__summary', text: project.summary }), 'fade-up', 0.1);
        const tags = createElement('ul', { className: 'tag-list', attrs: { 'aria-label': `${project.name} technology stack` } });

        project.tags.forEach((tag, tagIndex) => {
            tags.append(applyAnimation(createElement('li', { className: 'tag-list__item', text: tag }), 'pop-in', tagIndex * 0.1));
        });

        identity.append(title, type);
        header.append(identity, createElement('div', { className: 'project-card__links' }));
        header.lastElementChild.append(link);
        article.append(header, summary, tags);
        mount.append(article);
    });
};

const renderTimeline = (selector, items) => {
    const mount = document.querySelector(selector);
    if (!mount) return;

    items.forEach((item, index) => {
        const node = applyAnimation(createElement('article', {
            className: 'timeline-card liquid-glass',
            attrs: { 'data-tilt': '' },
        }), 'slide-left', index * 0.15);
        const meta = applyAnimation(createElement('p', { className: 'timeline-card__meta' }), 'fade-in', 0.1);

        meta.append(
            createElement('span', { text: item.year }),
            createElement('span', { text: item.organization }),
        );

        node.append(
            meta,
            applyAnimation(createElement('h4', { className: 'timeline-card__title', text: item.title }), 'blur-in', 0.15),
        );

        if (item.description) {
            const lines = item.description.split('\n').filter(Boolean).map((line) => `<span>${line}</span>`).join('<br><br>');
            node.append(applyAnimation(createElement('p', { className: 'timeline-card__description', html: lines }), 'fade-up', 0.2));
        }

        mount.append(node);
    });
};

const renderCertifications = () => {
    const mount = document.querySelector('[data-certifications]');
    if (!mount) return;

    certifications.forEach((certificate, index) => {
        const card = applyAnimation(createElement('article', {
            className: 'certificate-card liquid-glass',
            attrs: { 'data-tilt': '' },
        }), 'scale-in', index * 0.1);
        const certificateAttrs = {
            href: certificate.url,
            title: `View ${certificate.name} Certificate`,
            'aria-label': `View ${certificate.name} certificate`,
        };

        if (certificate.url !== '#') {
            certificateAttrs.target = '_blank';
            certificateAttrs.rel = 'noopener noreferrer';
        }

        const link = createElement('a', {
            className: 'certificate-card__link',
            attrs: certificateAttrs,
        });
        const image = createElement('img', {
            className: 'certificate-card__image',
            attrs: {
                src: certificate.image,
                alt: `${certificate.name} Certificate`,
                loading: 'lazy',
                decoding: 'async',
            },
        });
        const info = createElement('div', { className: 'certificate-card__info' });

        link.append(image);
        info.append(
            applyAnimation(createElement('p', { className: 'certificate-card__issuer', text: certificate.issuer }), 'fade-in', 0.15),
            applyAnimation(createElement('h4', { className: 'certificate-card__name', text: certificate.name }), 'fade-in', 0.1),
        );
        card.append(link, info);
        mount.append(card);
    });
};

export const renderPortfolioContent = () => {
    renderStackGroups();
    renderProjects();
    renderTimeline('[data-experience]', experience);
    renderTimeline('[data-education]', education);
    renderCertifications();
};
