const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.json());

const loadData = () => {
  if (!fs.existsSync("data/users.json")) {
    fs.writeFileSync("data/users.json", JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync("data/users.json"));
};

const saveData = (data) => {
  fs.writeFileSync("data/users.json", JSON.stringify(data, null, 2));
};

app.post("/calcular", (req, res) => {
  const { name, email, totalEmissions } = req.body;
  const treesNeeded = totalEmissions / 1000;

  let users = loadData();
  const userIndex = users.findIndex((user) => user.email === email);

  if (userIndex !== -1) {
    return res.status(400).json({ message: "Usuário já cadastrado!" });
  } else {
    users.push({ name, email, totalEmissions });
  }

  saveData(users);
  res.json({ totalEmissions, treesNeeded });
});

app.get("/ranking", (_req, res) => {
  const users = loadData();
  users.sort((a, b) => a.totalEmissions - b.totalEmissions);
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
