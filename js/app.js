document.addEventListener("DOMContentLoaded", function () {
    const chokinButton = document.getElementById("chokin");
    const shuppiButton = document.getElementById("shuppi");
    const shakkinButton = document.getElementById("shakkin");
    const formContainer = document.getElementById("form-container");
    const dataList = document.getElementById("data-list");
    const totalAmountValue = document.getElementById("total-amount-value");
    const moneyChart = document.getElementById("moneyChart");
    const yearSelector = document.getElementById("year");

    let currentCategory = '';
    let chartInstance = null;

    // ローカルストレージからデータを取得
    function getDataFromLocalStorage(category) {
        const data = localStorage.getItem(category);
        return data ? JSON.parse(data) : [];
    }

    // ローカルストレージにデータを保存
    function saveDataToLocalStorage(category, data) {
        localStorage.setItem(category, JSON.stringify(data));
    }

    // 合計金額を更新
    function updateTotalAmount() {
        const data = getDataFromLocalStorage(currentCategory);
        const total = data.reduce((sum, item) => sum + parseFloat(item.money), 0);
        totalAmountValue.textContent = total.toLocaleString();
    }

    // データの表示（削除・編集機能追加）
    function displayData() {
        const data = getDataFromLocalStorage(currentCategory);
        dataList.innerHTML = '';

        if (data.length === 0) {
            dataList.innerHTML = '<p>データがありません。</p>';
            return;
        }

        const ul = document.createElement('ul');

        data.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = `${item.thing}: ¥${item.money} (${item.date})`;

            // 編集ボタン
            const editBtn = document.createElement('button');
            editBtn.textContent = "編集";
            editBtn.style.marginLeft = "10px";
            editBtn.addEventListener("click", function () {
                editItem(index);
            });

            // 削除ボタン
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = "削除";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.addEventListener("click", function () {
                deleteItem(index);
            });

            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
        });

        dataList.appendChild(ul);

        // 合計金額の更新
        updateTotalAmount();

        // 年選択の更新
        updateYearSelector();

        // グラフを描画
        displayChart();
    }

    // アイテム削除
    function deleteItem(index) {
        const data = getDataFromLocalStorage(currentCategory);
        data.splice(index, 1);
        saveDataToLocalStorage(currentCategory, data);
        displayData();
    }

    // アイテム編集
    function editItem(index) {
        const data = getDataFromLocalStorage(currentCategory);
        const item = data[index];

        document.getElementById("thing").value = item.thing;
        document.getElementById("money").value = item.money;
        document.getElementById("date").value = item.date;

        // 編集後に新しいデータを追加する
        data.splice(index, 1); // 編集するアイテムを削除
        saveDataToLocalStorage(currentCategory, data);

        formContainer.style.display = "block";
    }

    // 年選択セレクトボックスの更新
    function updateYearSelector() {
        const data = getDataFromLocalStorage(currentCategory);
        const years = new Set();
        data.forEach(item => {
            const year = new Date(item.date).getFullYear();
            years.add(year);
        });

        // セレクトボックスをリセットして年を追加
        yearSelector.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        });
    }

    // グラフの更新
    function displayChart() {
        const data = getDataFromLocalStorage(currentCategory);
        const selectedYear = parseInt(yearSelector.value, 10);
        const filteredData = data.filter(item => new Date(item.date).getFullYear() === selectedYear);

        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        const monthTotals = new Array(12).fill(0);

        filteredData.forEach(item => {
            const month = new Date(item.date).getMonth();
            monthTotals[month] += parseFloat(item.money);
        });

        // 古いグラフを削除（更新する）
        if (chartInstance) {
            chartInstance.destroy();
        }

        // 新しいグラフを作成
        chartInstance = new Chart(moneyChart, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: `${currentCategory} 金額 (${selectedYear})`,
                    data: monthTotals,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // データの保存
    const moneyForm = document.getElementById("moneyForm");
    moneyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const thing = document.getElementById("thing").value;
        const money = document.getElementById("money").value;
        const date = document.getElementById("date").value;

        const newItem = { thing: thing, money: money, date: date };

        const data = getDataFromLocalStorage(currentCategory);
        data.push(newItem);

        saveDataToLocalStorage(currentCategory, data);

        document.getElementById("thing").value = "";
        document.getElementById("money").value = "";
        document.getElementById("date").value = "";

        formContainer.style.display = "none";

        displayData();
    });

    // ボタンのクリックイベント
    chokinButton.addEventListener("click", function () {
        currentCategory = 'chokin';
        formContainer.style.display = "block";
        displayData();
    });

    shuppiButton.addEventListener("click", function () {
        currentCategory = 'shuppi';
        formContainer.style.display = "block";
        displayData();
    });

    shakkinButton.addEventListener("click", function () {
        currentCategory = 'shakkin';
        formContainer.style.display = "block";
        displayData();
    });

});
