setInterval(()=>collectAndUpdateInfo(), 1000);

function getMealItems(){
    return Array.from(document.querySelectorAll('.catalog-item')).map(item=>{
        const weight= +item.querySelector('.meal-card__weight').textContent;
        const count = +item.querySelector('input').value
        return {
            name: item.querySelector('.meal-card__name').textContent,
            totalProteins: (+item.querySelector('.meal-card__proteins').textContent.replaceAll(',', "."))*weight/100 * count,
            totalCalories: (+item.querySelector('.meal-card__calories').textContent)*weight/100 * count,
        }
    })
}

function collectAndUpdateInfo(){
    const mealItems = getMealItems();
    if (!mealItems || mealItems.length === 0) {
        updateInfo(0, 0);
        return;
    }
    let sumCalories = 0;
    let sumProteins = 0;

    const products = document.querySelectorAll('#cart_product_addable .basket__item-name');

    products.forEach(product=>{
        const name = product.textContent;
        const meal = mealItems.find((item=> item.name === name));
        if (meal){
            sumCalories += meal.totalCalories;
            sumProteins += meal.totalProteins;
        }
    })
    updateInfo(sumCalories, sumProteins);

}

function updateInfo(sumCalories, sumProteins){
    document.querySelector('.basket__footer .addedInfo')?.remove();
    const container = document.createElement('div');
    container.classList.add('addedInfo');

    const caloriesChild = document.createElement('div');
    caloriesChild.textContent="Калории: " + Math.floor(sumCalories);

    const proteinsChild = document.createElement('div');
    proteinsChild.textContent="Протеины: " + Math.floor(sumProteins);


    container.appendChild(caloriesChild)
    container.appendChild(proteinsChild)
    document.querySelector('.basket__footer').prepend(container);
}
