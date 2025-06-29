let products = [];
  let selectedProduct = null;

  document.addEventListener('DOMContentLoaded', function () {
    fetch('data.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Ошибка загрузки файла: ${response.status}`);
        }
        return response.text();
      })
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        products = lines.map(line => {
          const [name, kcal, prot, fat, carb, fiber, imgid] = line.split(',').map(x => x.trim());
          return {
            name: name.toLowerCase(),
            displayName: name,
            kcal: parseFloat(kcal),
            prot: parseFloat(prot),
            fat: parseFloat(fat),
            carb: parseFloat(carb),
            fiber: parseFloat(fiber),
            imgid: imgid,
          };
        });
        })
      .catch(error => {
        console.error('Ошибка при загрузке CSV:', error);
      });
  });

  
  // Поиск продукта
  function searchProduct() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const weight = parseFloat(document.getElementById('weightInput').value) || 100;
  const product = products.find(p => p.name.includes(query));
  const container = document.getElementById('productInfo');
  container.innerHTML = "";
  if (!product) {
    container.innerHTML = "<p>Продукт не найден</p>";
    return;
  }

  selectedProduct = product;
  const factor = weight / 100;
  container.innerHTML = `
    <p><strong>${product.displayName}</strong></p>
    <p>На ${weight} г:</p>
    <ul>
      <li>Калории: ${(product.kcal * factor).toFixed(1)}</li>
      <li>Белки: ${(product.prot * factor).toFixed(1)} г</li>
      <li>Жиры: ${(product.fat * factor).toFixed(1)} г</li>
      <li>Углеводы: ${(product.carb * factor).toFixed(1)} г</li>
      <li>Клетчатка: ${(product.fiber * factor).toFixed(1)} г</li>
    </ul>
    ${product.imgid?'<img src="./img/'+product.imgid+'.webp"/>':''}
    <button onclick='addToMenu(selectedProduct, ${weight})'>Добавить в меню</button>`
}


  function addToMenu(product, weight) {
  const table = document.querySelector('#menuTable tbody');
  const row = document.createElement('tr');
  const factor = weight / 100;

  row.innerHTML = `
    <td>${product.displayName}</td>
    <td>${weight}</td>
    <td>${(product.kcal * factor).toFixed(1)}</td>
    <td>${(product.prot * factor).toFixed(1)}</td>
    <td>${(product.fat * factor).toFixed(1)}</td>
    <td>${(product.carb * factor).toFixed(1)}</td>
    <td>${(product.fiber * factor).toFixed(1)}</td>
    <td id="remove" onclick="removeRow(this)">Удалить</td>
  `;

  table.appendChild(row);
  updateTotals();
}


  function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateTotals();
  }

  function updateTotals() {
    let kcal = 0, prot = 0, fat = 0, carb = 0, fiber = 0;
    document.querySelectorAll('#menuTable tbody tr').forEach(row => {
      kcal += parseFloat(row.cells[2].textContent);
      prot += parseFloat(row.cells[3].textContent);
      fat  += parseFloat(row.cells[4].textContent);
      carb += parseFloat(row.cells[5].textContent);
      fiber+= parseFloat(row.cells[6].textContent);
    });

    document.getElementById('totalKcal').textContent = kcal.toFixed(1);
    document.getElementById('totalProt').textContent = prot.toFixed(1);
    document.getElementById('totalFat').textContent = fat.toFixed(1);
    document.getElementById('totalCarb').textContent = carb.toFixed(1);
    document.getElementById('totalFiber').textContent = fiber.toFixed(1);
  }

  // Автозаполнение
  const searchInput = document.getElementById("searchInput");
  const suggestions = document.getElementById("suggestions");

  searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();
    suggestions.innerHTML = "";
    if (value.length < 1 || products.length === 0) return;

    const matches = products
      .filter(p => p.name.includes(value))
      .slice(0, 10);

    matches.forEach(match => {
      const li = document.createElement("li");
      li.textContent = match.displayName;
      li.onclick = () => {
        searchInput.value = match.displayName;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(li);
    });
  });

  document.addEventListener("click", function (e) {
    if (e.target !== searchInput) {
      suggestions.innerHTML = "";
    }
  });