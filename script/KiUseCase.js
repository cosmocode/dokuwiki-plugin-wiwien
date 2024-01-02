class WiWienKiUseCase extends HTMLElement {

    json = {};
    result = {};
    output = null;

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<slot></slot>`;
        this.output = this.shadowRoot.querySelector('slot');

        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "script/KiUseCase.css");
        this.shadowRoot.appendChild(linkElem);

        this.loadData();
    }


    /**
     * Load the JSON data
     *
     * @returns {Promise<void>}
     */
    async loadData() {
        const url = 'kiusecase.json';
        const data = await fetch(url);
        this.json = await data.json();
        this.renderPage(this.json.start);
    }

    /**
     * Render a question page
     *
     * @param {string} page The page ID to render
     */
    renderPage(page) {
        const pageData = this.json.pages[page];

        const pageElement = document.createElement('div');
        const questionElement = document.createElement('p');
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
     * Render the result page by coloring the premade BMC
     *
     * @returns {Promise<void>}
     */
    async renderResult() {
        const response = await fetch('bmc.svg');
        const svgElement = document.createElement('div');
        svgElement.innerHTML = await response.text();

        for (const key in this.json.pages) {
            const answer = this.result[key] ?? {};

            // color the boxes according to the value
            const box = svgElement.querySelector(`[data-address="${key}_box"] path`);
            if (box) {
                switch (answer.v ?? 0) {
                    case 2:
                        box.setAttribute('stroke', '#DAE8FC');
                        break;
                    case 1:
                        box.setAttribute('stroke', '#E6E6E6');
                        break;
                    default:
                        box.setAttribute('stroke', '#ffffff');
                        break;
                }
            }

            const text = svgElement.querySelector(`[data-address="${key}_text"] foreignObject div div div`);
            if (text) {
                text.innerText = answer.t ?? '';
            }
        }

        const resultElement = document.createElement('p');
        resultElement.innerHTML = this.json.result;
        this.output.innerHTML = '';
        this.output.append(resultElement);
        this.output.append(svgElement);
    }
}

customElements.define('wiwien-kiusecase', WiWienKiUseCase);

