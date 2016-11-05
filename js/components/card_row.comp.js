(function() {
    'use strict';
    
    let template = `
        <style>
            :host {
                display: block;
            }
            .row {
                padding: 7px 10px;
            }
            .row:hover {
                background-color: var(--highlight-color);
            }
            
            .drag {
                // opacity: .7;
            }
            
            .over {
                border-bottom: 2px solid var(--accent-color);
                padding: 7px 10px 5px 10px;
            }
            
            .highlight {
                background-color: var(--highlight-color);
            }
            
            .icon {
                height: 18px;
                width: 18px;
                float: left;
                margin-right: 10px;
            }
            
            .title {
                font-size: 16px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        </style>
        
        <div class="row" draggable="true">
            <img class="icon"></img>
            <div class="title">Site Title</div>
        </div>
    `;
    
    class CardRow extends HTMLElement {
        createdCallback() {
            this.createShadowRoot().innerHTML = template;
            this.$row = this.shadowRoot.querySelector('.row');
            this.$icon = this.shadowRoot.querySelector('.icon');
            this.$title = this.shadowRoot.querySelector('.title');
            
            let self = this;
            
            this.$row.addEventListener('dragstart', function(ev) {
                ev.dataTransfer.effectAllowed = 'move';
                ev.dataTransfer.setData('sitedivid', self.id);
                this.classList.add('drag');

                return false;
            });
            
            this.$row.addEventListener('dragend', function(ev) {
                if(ev.dataTransfer.types.includes('sitedivid')) {
                    this.classList.remove('drag');
                    ev.preventDefault();

                    return false;
                }
            });
            
            this.$row.addEventListener('dragover', function(ev) {
                if (ev.dataTransfer.types.includes('sitedivid')) {
                    ev.dataTransfer.dropEffect = 'move';

                    if (ev.preventDefault) {
                        ev.preventDefault();
                    }

                    this.classList.add('over');
                    
                    return false;
                }
            });

            this.$row.addEventListener('dragleave', function(ev) {
                if (ev.dataTransfer.types.includes('sitedivid')) {
                    ev.preventDefault();
                    this.classList.remove('over');
                }
            });
            
            this.$row.addEventListener('drop', function(ev) {
                if (ev.dataTransfer.types.includes('sitedivid')) {
                    if (ev.stopPropagation) {
                        ev.stopPropagation();
                    }

                    this.classList.remove('over');

                    let fromRow = this.ownerDocument.getElementById(ev.dataTransfer.getData('sitedivid'));
                    let toRow = this.parentNode.host;
                    let card = this.parentNode.host.parentNode;
                    
                    let index;
                    for (let i=0; i<card.children.length; i++) {
                        if (toRow.id == card.children[i].id) {
                            index = i + 1;
                        }
                    }

                    card.insertBefore(fromRow, toRow.nextSibling);
                    
                    ChromeService.moveBookmark(fromRow.data.id, card.data.id, index);
                }
            });
            
            this.addEventListener('click', (ev) => {
                return ev.button === 0 ? this.handlePrimaryClick() : this.handleAuxClick(ev.altKey);
            });

            this.addEventListener('auxclick', (ev) => {
                return this.handleAuxClick(ev.altKey);
            });
        }

        handlePrimaryClick() {
            ChromeService.updateTab(this.data.url);
        }

        handleAuxClick(alt) {
            ChromeService.openNewTab(this.data.url, alt);
        }
        
        attributeChanged(attrName, oldVal, newVal) {
            console.log(attrName + " changed");
            switch (attrName) {
                case 'highlight':
                    this.updateHighlight();
                    break;
            }
        }
        
        get site() {
            let s = this.getAttribute('site');
            s = JSON.parse(s);
            return s;
        }
        
        set site(val) {
            this.setAttribute('site', JSON.stringify(val));
        }
        
        get title() {
            let title = this.attribute('title');
            return title;
        }
        
        set title(val) {
            this.setAttribute('title', val);
        }
        
        get data() {
            return JSON.parse(this.getAttribute('data'));
        }
        
        set data(val) {
            this.setAttribute('data', JSON.stringify(val));
            
            this.$icon.src = 'https://plus.google.com/_/favicon?domain=' + val.url;
            this.$title.textContent = val.title;
        }
        
        get highlight() {
            return JSON.parse(this.getAttribute('highlight'));
        }
        
        set highlight(val) {
            this.setAttribute('highlight', JSON.stringify(val));
            this.updateHighlight();
        }
        
        updateInfo() {
            this.$icon.src = 'https://plus.google.com/_/favicon?domain=' + this.data.url;
            this.$title.textContent = this.data.title;
        }
        
        updateHighlight() {
            if (this.highlight === true) {
                this.$row.classList.add('highlight');
            } else {
                this.$row.classList.remove('highlight');
            }
        }
    }
    
    document.registerElement('card-row', CardRow);
})();