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
    image = '';
    colors = {
        "0": '#fff',
        "1": '#DAE8FC',
        "2": '#E6E6E6',
        "3": '#2d5169'
    };

    constructor() {
        super();
        this.image = this.getAttribute('image');
    }

    connectedCallback() {
        this.output = document.createElement('div');
        this.append(this.output);
        this.json = JSON.parse(this.getAttribute('json'));
        this.renderPage(this.json.start);

        this.colors = Object.assign(this.colors, this.json.colors);
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
        const response = await fetch(this.image, {cache: 'no-cache'});
        const svgElement = document.createElement('div');
        svgElement.classList.add('result-image');
        svgElement.innerHTML = await response.text();

        /**
         * Color the boxes according to the value
         *
         * @param a Box address
         * @param c Color
         * @param t Text
         */
        function color(a, c, t) {
            const box = svgElement.querySelector(`[data-address="${a}_box"]`);
            if (box) {
                const highlights = box.querySelectorAll('path, ellipse');
                highlights.forEach(element => {
                    element.setAttribute('fill', c);
                    element.setAttribute('fill-opacity', '60%');
                });
            }

            const text = svgElement.querySelector(`[data-address="${a}_text"] foreignObject div div div`);
            if (text) {
                text.innerText = t;
            }
        }

        for (const page in this.json.pages) {
            const answer = this.result[page] ?? {};
            // target can differ from key and can be explicitly defined as "r"
            let key = answer['r'] ?? page;
            let v = answer.v ?? [0];

            // make sure we can iterate over keys and values
            if (!Array.isArray(key)) {
                key = [key];
            }
            if (!Array.isArray(v)) {
                v = [v];
            }

            key.forEach((address, idx) => {
                color.call(this, address, this.colors[v[idx]], answer.t ?? '');
            });
        }

        const resultElement = document.createElement('div');
        resultElement.innerHTML = this.json.result;
        this.output.innerHTML = '';
        this.output.append(resultElement);
        this.output.append(svgElement);
    }
}

customElements.define('wiwien-expert', WiwienExpert);
