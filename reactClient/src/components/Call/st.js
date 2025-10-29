let productDesription = document.querySelector('.product__description')


let splitTestContainer = document.createElement('div')
splitTestContainer.className = 'splitTestContainer'

let discountDiv = document.createElement('div')
discountDiv.className = 'discountDiv'
discountDiv.textContent = '20% OFF'

splitTestContainer.append(discountDiv)

let contentDivOuter = document.createElement('div')
contentDivOuter.className = 'contentDivOuter'


let imageDiv = document.createElement('div')
imageDiv.className = 'imageDiv'

let image = document.createElement('img')
image.src = 'https://cdn.shopify.com/s/files/1/0612/5086/3345/files/Group_72_1.png?v=1726779947'
image.alt = 'Split Testing'

imageDiv.append(image)

contentDivOuter.append(imageDiv)


let contentDiv = document.createElement('div')
contentDiv.className = 'contentDiv'

let h4 = document.createElement('h4')
h4.className = 'contentDivH4'
h4.textContent = 'Splittestin Gearg'

contentDiv.append(h4)

let p = document.createElement('p')
p.className = 'contentDivP'
p.textContent = 'Lorem ipsum dolor sit amet'

contentDiv.append(p)

let innerContentDiv = document.createElement('div')
innerContentDiv.className = 'innerContentDiv'


contentDiv.append(innerContentDiv)

let priceContentDiv = document.createElement('div')
priceContentDiv.className = 'priceContentDiv'

innerContentDiv.append(priceContentDiv)

let price = document.createElement('p')
price.className = 'priceNotCross'
price.textContent = '$62'

priceContentDiv.append(price)

let priceCross = document.createElement('p')
priceCross.className = 'priceCross'
priceCross.textContent = '$77'

priceContentDiv.append(priceCross)

let addToChartButton = document.createElement('button')
addToChartButton.className = 'addToChartButton'
addToChartButton.textContent = 'ADD'

innerContentDiv.append(addToChartButton)
contentDivOuter.append(contentDiv)

splitTestContainer.append(contentDivOuter)

productDesription.parentElement.insertBefore(splitTestContainer, productDesription)

let style = document.createElement('style')

style.innerHTML = `

    .splitTestContainer{
    
        display: flex;
        flex-direction: column;

    }
    .splitTestContainer .discountDiv{
    
        background: #feb728;
        padding: 0.25rem 1rem;
        border-radius: 6px 6px 0 0;
        width: fit-content;
        font-weight: 600;

    }

    .splitTestContainer .contentDivOuter {
        display: flex;
        background: #f4f4f4;
        width: fit-content;
        border: 1px solid rgba(6, 4, 3, 0.1);
        border-radius: 4px;
    }

    .splitTestContainer .contentDivOuter .imageDiv{
        display: flex;
        background: #d7d7d7;
        padding: 1.5rem 1rem;
        align-items: center;
    }
    .splitTestContainer .contentDivOuter .contentDiv{
        padding: 1rem 6rem 1rem 2rem;
        flex-grow: 1;
        width: 100%;
    }
    .splitTestContainer .contentDivOuter .contentDiv .contentDivH4{ 

        font-weight: 600;
        font-size: 2rem;
        padding:0;
        margin: 0;
    }

    .splitTestContainer .contentDivOuter .contentDiv .contentDivP{ 
        font-weight: 300;
        font-size: 1.2rem;
        padding:0;
        margin: 0;

    }

    .splitTestContainer .contentDivOuter .contentDiv .innerContentDiv{ 
        margin-top: 0.75rem;
        display: flex;
        width: 100%;
        justify-content: space-between;
        gap: 2rem;

    }
    .splitTestContainer .contentDivOuter .contentDiv .priceContentDiv{ 
        
        display: flex;
        gap: 0.5rem;
        align-items: center;

    }

    .splitTestContainer .contentDivOuter .contentDiv .priceContentDiv .priceNotCross{ 
        text-decoration: none;
        font-weight: 600;
        color: #d50000;
        margin:0;
    }   
    .splitTestContainer .contentDivOuter .contentDiv .priceContentDiv .priceCross{ 
        text-decoration: line-through;
        font-weight: 600;
        color: gray;
         margin:0;
    } 
    .splitTestContainer .contentDivOuter .contentDiv .addToChartButton{ 
       
        background: #443f3e;
        color: white;
        padding: 0 3rem;
        border-radius: 3px;
        border: none;

    }
`
productDesription.parentElement.insertBefore(style, productDesription)