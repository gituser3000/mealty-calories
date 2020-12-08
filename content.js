setInterval(()=>collectAndUpdateInfo(), 1000);

let excludedFromCount = new Map();

function getMealItems(){
    return Array.from(document.querySelectorAll('.catalog-item')).map(item=>{
        const weight= +item.querySelector('.meal-card__weight').textContent;
        return {
            name: item.querySelector('.meal-card__name').textContent,
            proteins: (+item.querySelector('.meal-card__proteins').textContent.replaceAll(',', "."))*weight/100,
            calories: (+item.querySelector('.meal-card__calories').textContent)*weight/100
        }
    })
}

function collectAndUpdateInfo(){
    const mealItems = getMealItems();
    if (!mealItems || mealItems.length === 0) {
        updateInfo(0, 0);
        return;
    }
    let items = [];
    let sumCalories = 0;
    let sumProteins = 0;

    let products = Array.from(document.querySelectorAll('#cart_product_addable .basket__item')).map(item=>({
        name: item.querySelector('.basket__item-name').textContent,
        count: item.querySelector('input').value
    }));
    const excluded = new Map(excludedFromCount);

    products.map(item=> ({
        count: item.count - (excluded.get(item.name) || 0),
        name: item.name
    }))
        .filter(item=> item.count)
        .forEach(product=>{
            const name = product.name;
            items.push(product);
            const meal = mealItems.find((item=> item.name === name));
            if (meal){
                sumCalories += meal.calories * product.count;
                sumProteins += meal.proteins * product.count;
            }
    })
    updateInfo(sumCalories, sumProteins, items);

}

function updateInfo(sumCalories, sumProteins, items){
    document.querySelector('.basket__footer .addedInfo')?.remove();
    const container = document.createElement('div');
    container.classList.add('addedInfo');

    const caloriesChild = getDivWithNameAndContent("Калории: ", Math.floor(sumCalories));
    const proteinsChild = getDivWithNameAndContent("Протеины: ", Math.floor(sumProteins));

    const splitButton = document.createElement('button')
    splitButton.textContent = "Отделить";
    splitButton.addEventListener('click', ()=> splitToSeparateBlock(sumCalories, sumProteins, items, container));

    container.appendChild(caloriesChild)
    container.appendChild(proteinsChild)
    if (sumCalories) container.appendChild(splitButton)

    document.querySelector('.basket__footer').prepend(container);
}

function getDivWithNameAndContent(name, content){
    const item = document.createElement('div');
    item.textContent=name +": " +content;
    return item
}

function splitToSeparateBlock(calories, proteins, items, insertAfter){
    items.forEach(item=>{
        const excludedCount = excludedFromCount.get(item.name);
        excludedFromCount.set(item.name, (excludedCount || 0) + item.count);
    });

    const splitted = document.createElement('div');
    splitted.appendChild(document.createElement('hr'))
    splitted.appendChild(getDivWithNameAndContent(items.map(item=>item.name+"("+item.count + ")").join(', '), ''));
    splitted.appendChild(getDivWithNameAndContent('Калории', calories));
    splitted.appendChild(getDivWithNameAndContent('Протеины', proteins));
    insertAfter.after(splitted);
}
