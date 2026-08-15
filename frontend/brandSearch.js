const searchInput = document.getElementById("searchBrand");

const brandCards = document.querySelectorAll(".brand-card");


searchInput.addEventListener("keyup", function(){

    let searchValue = searchInput.value.toLowerCase();


    brandCards.forEach((card)=>{

        let brandName = card.querySelector("h2").textContent.toLowerCase();


        if(brandName.includes(searchValue)){
            card.style.display = "block";
        }
        else{
            card.style.display = "none";
        }

    });

});