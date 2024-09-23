document.getElementById("carona").addEventListener("change", function () {
  const passengerCountDiv = document.getElementById("passengerCountDiv");
  if (this.value === "sim") {
    passengerCountDiv.style.display = "flex";
  } else {
    passengerCountDiv.style.display = "none";
  }
});

document.getElementById("transport").addEventListener("change", function () {
  const fuelTypeDiv = document.getElementById("fuelTypeDiv");
  if (this.value === "carro" || this.value === "moto") {
    fuelTypeDiv.style.display = "flex";
  } else {
    fuelTypeDiv.style.display = "none";
  }
});

document.getElementById("transport").addEventListener("change", function () {
  const tripSharedDiv = document.getElementById("tripSharedDiv");
  if (this.value === "carro" || this.value === "moto") {
    tripSharedDiv.style.display = "flex";
  } else {
    tripSharedDiv.style.display = "none";
  }
});

document
  .getElementById("userForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const distance = document.getElementById("distance").value;
    const transport = document.getElementById("transport").value;
    const carona = document.getElementById("carona").value;
    const passengerCount =
      carona === "sim" ? document.getElementById("passengerCount").value : 1;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    if (
      (transport === "moto" && passengerCount > 1) ||
      (transport === "carro" && passengerCount > 4)
    ) {
      alert(
        "Número de passageiros inválido para o tipo de transporte selecionado."
      );
      return;
    }

    let emissionsPerKm = {
      carro: { gasolina: 120, alcool: 85, diesel: 100 },
      moto: { gasolina: 80, alcool: 60 },
      onibus: 50,
      bicicleta: 0,
    };

    const peopleOnBoard = passengerCount + 1;

    let totalEmissions;

    if (transport === "carro" || transport === "moto") {
      const fuelType = document.getElementById("fuelType").value;
      totalEmissions =
        (distance * emissionsPerKm[transport][fuelType]) / peopleOnBoard;
    } else {
      totalEmissions = (distance * emissionsPerKm[transport]) / peopleOnBoard;
    }

    const response = await fetch("/calcular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        distance,
        transport,
        peopleOnBoard,
        name,
        email,
        totalEmissions,
      }),
    });

    if (response.status === 400) {
      document.getElementById("result-content").innerHTML = `
        <p style="color: red;">O usuário com este email já está cadastrado!</p>
      `;
      return;
    }

    const result = await response.json();

    document.getElementById("result-content").innerHTML = `
        <p>Nome: ${name}</p>
        <p>Tipo de Transporte: ${transport}</p>
        <p>Distância percorrida: ${distance} km</p>
        <p>Emissões totais (por pessoa): ${result.totalEmissions.toFixed(
          2
        )} g de CO₂</p>
        <p>Árvores necessárias para compensar: ${Math.ceil(
          result.treesNeeded
        )} árvores</p>
    `;

    updateRanking();

    document.getElementById("userForm").reset();
    document.getElementById("passengerCountDiv").style.display = "none";
    document.getElementById("fuelTypeDiv").style.display = "none";
  });

async function updateRanking() {
  const response = await fetch("/ranking");
  const ranking = await response.json();
  let rankingHtml = "<ul>";
  ranking.forEach((user) => {
    rankingHtml += `<li>${user.name} - (${
      user.email
    }): ${user.totalEmissions.toFixed(2)} g de CO₂/km</li>`;
  });
  rankingHtml += "</ul>";
  document.getElementById("ranking-content").innerHTML = rankingHtml;
}

document.addEventListener("DOMContentLoaded", updateRanking);
