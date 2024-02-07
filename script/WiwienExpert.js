/**
 * This is a web component encapsulating the mechanism of the Expert System
 *
 * Note this web component does NOT use a shadow DOM, so it uses all the CSS
 * from the parent document.
 */
class WiwienExpert extends HTMLElement {

    json = {};
    result = {};
    output = null;
    base = '';
    colors = {};

    constructor() {
        super();
        this.base = this.getAttribute('base');
    }

    connectedCallback() {
        this.output = document.createElement('div');
        this.append(this.output);
        this.json = JSON.parse(this.getAttribute('json'));
        this.renderPage(this.json.start);
        this.colors.default = this.json.colors.default ?? '#fff';
        this.colors.highlight1 = this.json.colors.highlight1 ?? '#DAE8FC';
        this.colors.highlight2 = this.json.colors.highlight2 ?? '#E6E6E6';
    }

    /**
     * Render a question page
     *
     * @param {string} page The page ID to render
     */
    renderPage(page) {
        const pageData = this.json.pages[page];

        const pageElement = document.createElement('div');
        const questionElement = document.createElement('div');
        const answerElement = document.createElement('div');
        pageElement.append(questionElement);
        pageElement.append(answerElement);
        questionElement.innerHTML = pageData.q;

        const answers = pageData.a;
        answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.innerHTML = answer.c;
            answerButton.addEventListener('click', () => {
                this.result[page] = answer; // save the answer
                if (answer.n) {
                    this.renderPage(answer.n);
                } else {
                    this.renderResult();
                }
            });
            answerElement.append(answerButton);
        });

        this.output.innerHTML = '';
        this.output.append(pageElement);
    }

    /**
     * Render the result page by coloring the premade SVG image
     *
     * @returns {Promise<void>}
     */
    async renderResult() {
        const response = await fetch(this.base + this.json.image + '.svg', {cache: 'no-cache'});
        const svgElement = document.createElement('div');
        svgElement.classList.add('result-image');
        svgElement.innerHTML = await response.text();

        for (let key in this.json.pages) {
            const answer = this.result[key] ?? {};
            key = answer['r'] ?? key;

            // color the boxes according to the value
            const box = svgElement.querySelector(`[data-address="${key}_box"] path, [data-address="${key}_box"] ellipse`);
            if (box) {
                switch (answer.v ?? 0) {
                    case 2:
                        box.setAttribute('fill', this.colors.highlight2);
                        break;
                    case 1:
                        box.setAttribute('fill', this.colors.highlight1);
                        break;
                    default:
                        box.setAttribute('fill', this.colors.default);
                        break;
                }
            }

            const text = svgElement.querySelector(`[data-address="${key}_text"] foreignObject div div div`);
            if (text) {
                text.innerText = answer.t ?? '';
            }
        }

        const resultElement = document.createElement('div');
        resultElement.innerHTML = this.json.result;
        this.output.innerHTML = '';
        this.output.append(resultElement);
        this.output.append(svgElement);
    }
}

customElements.define('wiwien-expert', WiwienExpert);

