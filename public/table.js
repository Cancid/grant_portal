document.addEventListener('DOMContentLoaded', function() {

    getTable()
    async function getTable() {
      const response = await fetch('/table');
      const data = await response.json();
    
      const tbod = document.getElementById("tbod");
      idNum = 0;
      for (ele of data) {
        const row = document.createElement("tr");
        row.classList.add("row");
        row.id = "row-" + idNum;
        

        function makeRows(data) {
          let col = document.createElement("td");
          col.textContent = data;
          row.appendChild(col);
        
        };

        Object.values(ele).forEach(makeRows);  
        tbod.appendChild(row);

        const curId = ele.rowid;

        const today = new Date()
        let date = new Date(ele.due_date)
        const daysLeft = Math.round(Math.abs(date - today)/(1000 * 3600 *24))
        if (daysLeft <= 4) {
           const notify =  document.getElementById("notifications");
           const notification = document.createElement("a");
           notification.setAttribute("href", `http://localhost:3000/?grantid=${curId}`);
           notification.classList.add("collection-item");
           if (daysLeft === 0) {
                notification.textContent = `${ele.grant} is due today!`
           } else {
                notification.textContent = `${ele.grant} is due in ${daysLeft} day!`;
           };
           notify.appendChild(notification);
        };
        

        row.addEventListener("click", function(){
            window.location.href = `http://localhost:3000/?grantid=${curId}`
        
        
       
        //for (ele.due_date)
        });
        idNum++;
      };

    };

    //Sorting code
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        if (th.classList.contains('headerSortDown') || th.classList.length === 0) {
            th.classList.add('headerSortUp');
            th.classList.remove('headerSortDown');
        } else {
            th.classList.add('headerSortDown')
            th.classList.remove('headerSortUp');
        };
        
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
        
    })));
});
