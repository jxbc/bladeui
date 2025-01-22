 class Blade {
    select(obj) {
        let selects = document.querySelectorAll('sel')
        obj = {
            delay: obj.delay || 300,
            alwaysDefault: obj.alwaysDefault || 0
        }

        selects.forEach((select) => {
            let sel = select.querySelector('.select')
            obj = {...obj, object: {
                id: select.id || null,
                attr: select.attributes || null,
                this: select
            }}
            if(!sel) {
                let selectHTML = `<div class="select none"></div>`
                let listHTML = function(data = '') {return `<div class="select_list hidden">${data}</div>`}
                let selectData = select.innerHTML
                
                select.insertAdjacentHTML('afterbegin', selectHTML)
                select.querySelector('.select').innerHTML = selectData
                selectData = select.querySelector('.select').innerHTML
                select.innerHTML = ''
                select.insertAdjacentHTML('afterbegin', `<div class="select none">${selectData}</div>`)

                selectData = select.querySelector('.select default').innerHTML
                select.querySelector('default').remove()
                select.querySelector('.select').innerHTML = listHTML(select.querySelector('.select').innerHTML)
                select.querySelector('.select').insertAdjacentHTML('afterbegin', `<default>${selectData}</default>`)
                
                return this.selectActions(select, obj)
            }

            this.selectActions(select, obj)
        })

        let mth = this
        return {
            add: function(sel, arr) {
                let selc = document.querySelector(sel)
                let clone = selc.cloneNode(true)

                for(let i of arr) {
                    let schema = {
                        text: i.text || 'object.text is null',
                        value: i.value || 'object.value is null'
                    }
                    let html = `<opt value="${schema.value}">${schema.text}</opt>`

                    clone.querySelector('.select .select_list').insertAdjacentHTML('beforeend', html)
                }

                selc.replaceWith(clone)
                mth.selectActions(clone, obj)
            }
        }
    }

    selectActions(select, obj) {
            let sel = select.querySelector('.select')
            let state = select.dataset.state = 0
            let list = sel.querySelector('.select_list')
            let def = sel.querySelector('default')
            let listItem = list.querySelectorAll('opt')
            let selected_item = null

            select.addEventListener('click', e => {
                if(e.target.closest('.select_list')) return 0
                if(state) {
                    list.style.zIndex = ``
                    sel.classList.add('none')
                    list.style.height = `0px`
                    state = select.dataset.state = 0

                    this.wait(obj.delay).then(() => {
                        list.classList.add('hidden')
                    })
                } else {
                    list.style.zIndex = `9`
                    sel.classList.remove('none')
                    list.style.height = `${list.scrollHeight}px`
                    state = select.dataset.state = 1

                    if(obj.alwaysDefault && select.dataset.current) {
                        def.classList.remove('none')
                        def.classList.add('always')
                        def.style.left = (20 + (String(select.dataset.current).length * 100) / 10) + "px"
                    }

                    this.wait(obj.delay).then(() => {
                        list.classList.remove('hidden')
                    })
                }
            })

            document.addEventListener('click', e => {
                if(!select.contains(e.target)) {
                    list.style.zIndex = ``
                    sel.classList.add('none')
                    list.style.height = `0px`
                    state = select.dataset.state = 0

                    this.wait(obj.delay).then(() => {
                        list.classList.add('hidden')
                    })
                }
            })

            listItem.forEach((item) => {
                const value = item.attributes.value.value
                const dataText = item.outerText

                item.addEventListener('click', e => {
                    select.dataset.currentValue = value
                    select.dataset.current = dataText
                    state = select.dataset.state = 0
                    
                    sel.classList.add('none')
                    list.style.height = `0px`
                    list.classList.add('hidden')
                    list.style.zIndex = ``

                    if(selected_item) {
                        selected_item.classList.remove('selected')
                    }
                    item.classList.add('selected')
                    selected_item = item

                    if(!hasClass(def, 'none')) {
                        def.classList.add('none')
                    }

                    document.dispatchEvent(new CustomEvent('select_blade', {detail: {value: value, text: dataText, time: +Date.now(), type: 'switch', object: obj.object}}))
                })
            })
    }

    on(eventType, callback) {
        if(eventType == 'select')
        document.addEventListener('select_blade', e => {
            callback(new BladeEvents(e.detail))
        })
    }

    async wait(time) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve()
          }, time)
        });
      }
}

class BladeEvents {
    constructor(data) {
        Object.assign(this, data)
    }
}

function hasClass(sel, cls) {
    if(sel.classList.contains(cls)) {
        return 1
    } else {
        return 0
    } 
}