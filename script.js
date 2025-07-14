const formSubmit = document.querySelector("#formSubmit")
let transactions = []

formSubmit.addEventListener("submit", function(e){
    e.preventDefault()

    //Recuperation des element 
const description = document.querySelector("#description").value.trim()
const montant = parseFloat(document.querySelector("#montant").value)
const typeRadio = document.querySelector("input[name='type']:checked")
const type = typeRadio ? typeRadio.value : null

// if(!description || isNaN(montant) || !type) {
//     alert("Merci de remplir les champs correctement")
//     return;
// }

const messageErreur = document.querySelector("#message-erreur")

if (!description || isNaN(montant) || !type) {
    messageErreur.textContent = "Merci de remplir les champs correctement.";
    return;
}

// Si tout est OK, on vide le message d’erreur
messageErreur.textContent = "";


//recuperation de la date 
const date = new Date()
const formatDate = date.toLocaleDateString('fr-Fr')

//creation de l'objet pour pouvoir l'utiluser
const transaction = {
    date: formatDate,
    description: description,
    type: type,
    montant: montant,
}
transactions.push(transaction)

afficherTransaction(transaction)

formSubmit.reset()
toggleDeleteAllButton()
updateTotals()
updateChart()
localStorage.setItem("transactions", JSON.stringify(transactions))

})


function updateTotals () {
    let totalRevenu = 0
    let totalDepense = 0

    transactions.forEach(transaction => {
        if (transaction.type === "revenu") {
            totalRevenu += transaction.montant
        }else if (transaction.type === "depense") {
            totalDepense += transaction.montant
        }
    })

const solde = totalRevenu - totalDepense

document.querySelector("#solde-revenu").textContent = totalRevenu.toLocaleString() + " $ "
document.querySelector("#solde-depenses").textContent = totalDepense.toLocaleString() + " $ "
document.querySelector("#solde-total").textContent = solde.toLocaleString() + " $ "
}

function afficherTransaction(transaction) {
        const tbody = document.querySelector("tbody")
    const tr = document.createElement("tr")
    const tddate = document.createElement("td")
    tddate.textContent = transaction.date
    tr.appendChild(tddate)
    const tddesc  = document.createElement("td")
    tddesc.textContent =  transaction.description
    tr.appendChild(tddesc)
    const tdtype = document.createElement("td")
    tdtype.textContent = transaction.type
    tr.appendChild(tdtype)
    const tdmontant = document.createElement("td")
    tdmontant.textContent = (transaction.type === "revenu" ? "+" : "-") + 
        transaction.montant.toLocaleString() + " $"
    tr.appendChild(tdmontant)


    const tddelete = document.createElement("td")
    tr.appendChild(tddelete)
    const btndel = document.createElement("button")
    btndel.textContent = " ❌ "
    btndel.classList.add("delete-btn")
    tddelete.appendChild(btndel)

    tbody.appendChild(tr)

    // btndel.addEventListener("click", function (){
    //     btndel.parentElement.parentElement.remove()
    // } )

    btndel.addEventListener("click", function (e) {
        //suppression de la ligne
        const ligne = e.target.closest("tr")
        ligne.remove()

        //Chercher la transaction correspondante
        const index = Array.from(tbody.children).indexOf(ligne);

        //Supprime l'objet du tableau
        transactions.splice(index, 1)

        updateTotals()
        localStorage.setItem("transactions", JSON.stringify(transactions))
        toggleDeleteAllButton()
        updateChart()


    })
}



const saved = localStorage.getItem("transactions")
if(saved) {
    transactions = JSON.parse(saved)
    transactions.forEach(transaction => {
        afficherTransaction(transaction)
    })
    updateTotals()
    toggleDeleteAllButton()
    updateChart()
}

const btndeleteAll = document.querySelector("#supprimer-all")
btndeleteAll.addEventListener("click", function () {
    if (!confirm("Voulez-vous vraiment supprimer toutes les transactions ?"))
    return;

    //Vider les champs
    document.querySelector("tbody").innerHTML = "";
    //reinitialiser le tableau de données
    transactions = []

    //Mise a jour le localstorage et total
    localStorage.removeItem("transactions")
    updateTotals();
    updateChart()

})
function toggleDeleteAllButton() {
    const btn = document.querySelector("#supprimer-all");
    btn.disabled = transactions.length === 0;
}




const searchInput = document.querySelector("#search")

searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase()
    const rows = document.querySelectorAll("tbody tr")

    rows.forEach(row => {
        const text = row.textContent.toLowerCase()
        row.style.display = text.includes(searchTerm) ? "" : "none"
    })
})






let chart = null

function updateChart() {
    const ctx = document.getElementById("budgetChart").getContext("2d")

    const revenus = transactions.filter(t => t.type === "revenu").reduce((acc, t) => acc + t.montant, 0)
    const depenses = transactions.filter(t => t.type === "depense").reduce((acc, t) => acc + t.montant, 0)

    const data = {
        labels: ["Revenus", "Dépenses"],
        datasets: [{
            data: [revenus, depenses],
            backgroundColor: ["#2ecc71", "#e74c3c"],
        }]
    }

    if (chart) {
        chart.data = data
        chart.update()
    } else {
        chart = new Chart(ctx, {
            type: "doughnut", // ou "bar"
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    },
                    title: {
                        display: true,
                        text: "Répartition Revenus vs Dépenses"
                    }
                }
            }
        })
    }
}

