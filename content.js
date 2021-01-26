const mealItems = resolveMealItems();
let excludedFromCount = new Map();

setInterval(()=>collectAndUpdateInfo(), 1000);

function resolveMealItems(){
    return Array.from(document.querySelectorAll('.catalog-item')).map(item=>{
        const weight= +item.querySelector('.meal-card__weight').textContent;
        const data=  {
            name: item.querySelector('.meal-card__name').textContent,
            id: item.querySelector('.meal-card__offer_id').textContent,
            proteins: (+item.querySelector('.meal-card__proteins').textContent.replaceAll(',', "."))*weight/100,
            calories: (+item.querySelector('.meal-card__calories').textContent)*weight/100,
            fats: (+item.querySelector('.meal-card__fats').textContent.replaceAll(',', "."))*weight/100,
            carbohydrates: (+item.querySelector('.meal-card__carbohydrates').textContent.replaceAll(',', "."))*weight/100
        }

        item.querySelector('.meal-card__name-note').parentNode.append(getContainerWithAllInfo(data.calories, data.proteins, data.fats, data.carbohydrates))

        return data;
    })
}

function collectAndUpdateInfo(){
    if (!mealItems || mealItems.length === 0) {
        updateInfo(0, 0);
        return;
    }
    let items = [];
    let sumCalories = 0;
    let sumProteins = 0;
    let sumFat = 0;
    let sumCarbohydrates = 0;

    let products = Array.from(document.querySelectorAll('#cart_product_addable .basket__item')).map(item=>({
        name: item.querySelector('.basket__item-name').textContent,
        count: item.querySelector('input').value,
        id: item.querySelector('.basket__item-controls').querySelectorAll('button')[1].getAttribute('data-product-id')
    }));

    products.map(item=> ({
        count: item.count - (excludedFromCount.get(item.id) || 0),
        name: item.name,
        id: item.id
    }))
        .filter(item=> item.count)
        .forEach(product=>{
            items.push(product);
            const meal = mealItems.find((item=> item.id === product.id));
            if (meal){
                sumCalories += meal.calories * product.count;
                sumProteins += meal.proteins * product.count;
                sumFat += meal.fats * product.count;
                sumCarbohydrates += meal.carbohydrates * product.count;
            }
    })
    updateInfo(sumCalories, sumProteins, sumFat, sumCarbohydrates, items);

}

function updateInfo(calories, proteins, fat, carbohydrates, items){
    document.querySelector('.basket__items .addedInfo')?.remove();
    if (!calories){
        return;
    }

    const container = getContainerWithAllInfo(calories, proteins, fat, carbohydrates, items)
    container.classList.add('addedInfo');

    const splitButton = document.createElement('button')
    splitButton.textContent = "Отделить";
    splitButton.addEventListener('click', ()=> splitToSeparateBlock(calories, proteins, fat, carbohydrates, items, container));

    container.appendChild(splitButton)

    document.querySelector('.basket__items').prepend(container);
}

function getDivWithNameAndContent(name, content){
    const item = document.createElement('div');
    item.textContent=name +": " +content;
    return item
}

function getContainerWithAllInfo(calories, proteins, fat, carbohydrates, items){
    const container = document.createElement('div');

    const names = items ? getDivWithNameAndContent(items.map(item=>item.name+"("+item.count + ")").join(', '), '') : null;
    const caloriesChild = getDivWithNameAndContent("Калории: ", Math.floor(calories));
    const proteinsChild = getDivWithNameAndContent("Белки: ", Math.floor(proteins));
    const fatChild = getDivWithNameAndContent("Жиры: ", Math.floor(fat));
    const carboHydratesChild = getDivWithNameAndContent("Углеводы: ", Math.floor(carbohydrates));

    if (names) container.appendChild(names);
    container.appendChild(caloriesChild)
    container.appendChild(proteinsChild)
    container.appendChild(fatChild)
    container.appendChild(carboHydratesChild)
    return container;
}

function splitToSeparateBlock(calories, proteins, fat, carbohydrates, items, insertAfter){
    items.forEach(item=>{
        const excludedCount = excludedFromCount.get(item.name);
        excludedFromCount.set(item.id, (excludedCount || 0) + item.count);
    });

    const container = getContainerWithAllInfo(calories, proteins, fat, carbohydrates, items);
    container.prepend(document.createElement('hr'))

    insertAfter.after(container);
}
