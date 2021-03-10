window.onload = ()=>{


    ajaxCallback("../data/nav.json", (result)=>{
        setToLS("navigation", result);
    });
    ajaxCallback("../data/meals.json", (result)=>{
        setToLS("meals", result);
    });
    ajaxCallback("../data/cousine.json", (result)=>{
        setToLS("cousine", result);
    });
    ajaxCallback("../data/types.json", (result)=>{
        setToLS("types", result)  
    });
    loadNav();
    loadItems();
    loadCousine();
    loadMealType();

  

    /*** creating apply fitler button functionality***/
    let filterButton = document.createElement("button");
    let buttonText = document.createTextNode("Apply filters");
    filterButton.appendChild(buttonText);
    $(filterButton).addClass("filterButton");
    $("#filters").append(filterButton);
    $('.filterButton').on("click", applyFilter);


    /*** adding event to sorting ddl ***/
    $("#sorting").on("change", sortItems);
    $("#search").on("keyup", searchMeals);
    

}

/***  FUNCTIONS ***/

function ajaxCallback(url, result){
    $.ajax({
        url:url,
        method:"GET",
        dataType:"json",
        success:result,
        error: ()=>{  }
    })
}

function setToLS(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLS(key){
    return JSON.parse(localStorage.getItem(key));
}

function loadNav(){
    let navItems = getFromLS("navigation");
    
    let html = "";
    for(item of navItems){
        html+=`<a class="nav-item nav-link" href="${item.href}">${item.linkName}</a>`;
        
    }
    navigation.innerHTML = html;
}

function loadItems(meals = getFromLS("meals")){
       
    let html="";
    setToLS("currentlyDisplayed", meals);
    for(item of meals){
        html+=`
        <div class="meal col-lg-3 col-md-4 col-sm-6">
        <img src="${item.image}" alt="Photo of: ${item.mealName}" class="img img-fluid mealImg">
        <div class="mealData">
            <h2>${item.mealName}</h2>
            <div class="cousine">
                ${processCousine(item.mealCousine)}
            </div>
            <p>${item.descriptionShort}</p>
            <div>
            <a href="#ex1" rel="modal:open"><input class="btn btn-success" type="button" value="order now"></a>
            </div>  
            <div class="price">
                <p>$${item.price.new}</p>
                <p>${item.price.old?"$"+item.price.old:""}</p>
            </div>
        </div>
    </div>
        `;
    loadMeals.innerHTML = html;
    
    }
}

function processCousine(ID){
    let cousineItems = getFromLS("cousine");
    let html="";
    for(cousineItem of cousineItems){
        if(ID==cousineItem.cousineId){
            html=`<p>${cousineItem.cousineName}</p>`;
            if(cousineItem.cousineFlag !=null){
                html+=`<img src="${cousineItem.cousineFlag}" alt="flag photo of ${cousineItem.cousineName} cousine">`;
            }
            break
        }
    }
    return html;
}

function loadCousine(){
    
    let cousineItems = getFromLS("cousine");
    let html = "<ul>";
    
    cousineItems.forEach(item => {
        html += `<li class="list-group-item">
                    <input type="checkbox" value="${item.cousineId}" class="" name="cousine"/> ${item.cousineName} <span>${processCousine(item)}</span>
                </li>`;
    });
    html += "</ul>";
    cousineFilters.innerHTML=html;
}

function loadMealType(){
    let typesItems = getFromLS("types");
    let html = "<ul>";
    
    typesItems.forEach(item => {
        html += `<li class="list-group-item">
                    <input type="checkbox" value="${item.typeID}" class="" name="type"/> ${item.typeName}
                </li>`;
    });
    html += "</ul>";
    mealTypeFilters.innerHTML=html;
}


function filterByCousine(){
    let meals = getFromLS("meals");
    let checkedCousine = [];
    
    $.each($("input[name='cousine']:checked"), function(){
        checkedCousine.push($(this).val())});

    if(checkedCousine.length==0) var filtered = meals;
    else{
        var filtered = meals.filter(el=>checkedCousine.includes(String(el.mealCousine)));
    }
    console.log(filtered);
    return filtered;
}

function filterByType(items = getFromLS("meals")){
    let checkedType = [];
    
    $.each($("input[name='type']:checked"), function(){
        checkedType.push($(this).val())});
    
    if (checkedType.length==0) return items;
    else{
        console.log(checkedType);
        console.log(items);
        return items.filter(el => el.mealType.some(elm => checkedType.includes(String(elm))));
    }

}

function applyFilter(){
    let filteredOnce = filterByCousine();
    let filteredTwice = filterByType(filteredOnce);
    console.log(filteredTwice);
    
    if (filteredTwice.length==0){
        loadMeals.innerHTML = `<div class="alert alert-danger mx-auto mt-5" role="alert">
        There are no meals for the set filters! Please try differetnt type of search.
      </div>`;
      setTimeout(loadItems, 3000);
    }

    else {
    loadItems(filteredTwice);
    }
    
    
}

function sortItems(){
    
    let selectedSort = $("#sorting").val();
    let itemsToSort = getFromLS("currentlyDisplayed");
    
    if(selectedSort=="priceAsc"){
        loadItems(itemsToSort.sort((a,b) => a.price.new > b.price.new ? 1 : -1));
    }
    else if(selectedSort=="priceDesc"){
        loadItems(itemsToSort.sort((a,b) => a.price.new > b.price.new ? -1 : 1));
    }
    else if(selectedSort=="NameAsc"){
        loadItems(itemsToSort.sort((a,b) => a.mealName > b.mealName ? 1 : -1));
    }
    else{
        loadItems(itemsToSort.sort((a,b) => a.mealName > b.mealName ? -1 : 1));

    }
}

function searchMeals(){
    let searchText = $("#search").val().toLowerCase();
    let items = getFromLS("meals");
    if(searchText!=''){
        let searched = items.filter(el=>{
            return (el.mealName.toLowerCase().indexOf(searchText) !== -1 ||el.descriptionShort.toLowerCase().indexOf(searchText) !== -1);
        });

        if(searched.length==0){
            loadMeals.innerHTML = `<div class="alert alert-danger mx-auto mt-5" role="alert">
        There are no meals for your search! Please try something else.
      </div>`;
        }
        else loadItems(searched);
    }
    else loadItems();
    
}




