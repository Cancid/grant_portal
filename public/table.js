let data;

document.addEventListener('DOMContentLoaded', function() {
  
    let sortButtons = document.querySelectorAll("button")
    sortButtons.forEach(sortButton => sortButton.addEventListener("click", () => {
      sortButtons.forEach(sortButton => { sortButton.classList.remove("red", "lighten-1");   
      });
      if (sortButton.value === "enabled") {
        getTable("all");
        sortButtons.forEach(sortButton => sortButton.value = "disabled");
      } else {
        sortTag = sortButton.getAttribute('id')
        getTable(`${sortTag}`);
        sortButton.classList.add("red", "lighten-1");
        sortButtons.forEach(sortButton => sortButton.value = "disabled");
        sortButton.value = "enabled";
      }
  ;}));
    
    
    getTable("all").then((data) => setNotifications(data));
    async function getTable(sortBy) {
      const response = await fetch(`/grants/data/${sortBy}`)
      data = await response.json();
    
      const tbod = document.getElementById("tbod");
      while (tbod.firstChild) {
        tbod.removeChild(tbod.firstChild)
      };
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
        row.addEventListener("click", function(){
          window.location.href = `http://localhost:3000/?grantid=${ele.rowid}`
        });

        idNum++;

      };

      return data
      
    };

    function setNotifications(data){
      console.log(data)
      const today = new Date()
      for (grant of data){
        let curId = grant.rowid;
        let date = new Date(grant.due_date)
        const daysLeft = Math.round(Math.abs(date - today)/(1000 * 3600 *24))
        if (daysLeft <= 4) {
           const notify =  document.getElementById("notifications");
           const notification = document.createElement("a");
           notification.setAttribute("href", `http://localhost:3000/?grantid=${curId}`);
           notification.classList.add("collection-item");
           if (daysLeft === 0) {
                notification.textContent = `${ele.grant} is due today!`
           } else {
                notification.textContent = `${ele.grant} is due in ${daysLeft} days!`;
           };
           notify.appendChild(notification);
        };
      };
    };
    
    
    // TODO: BUG: Have to press the header twice for it to sort first time after each button sort.
    //Sorting code
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    const sortNumOrString = (v1, v2) => v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    function comparer (idx, asc) {
      return (a, b) => (sortNumOrString(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx)));
    };

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        columns = document.querySelectorAll('th');
        console.log(th);
        columns.forEach(otherHeader => {

          if (otherHeader.classList.contains('headerSortDown') ||
           otherHeader.classList.contains('headerSortUp') && otherHeader !== th){

            otherHeader.asc = false;
            otherHeader.className = "";

          };
        });


        if (th.classList.contains('headerSortDown') || th.classList.length === 0) {
          th.classList.add('headerSortUp');
          th.classList.remove('headerSortDown');
          th.asc = false;

        } else {
          th.classList.add('headerSortDown');
          th.classList.remove('headerSortUp');

        };
        

        const table = document.getElementById("tbod");
        const tableRowIndex = Array.from(th.parentNode.children).indexOf(th)
        Array.from(table.querySelectorAll('tr'))
            .sort(comparer(tableRowIndex, th.asc = !th.asc))
            .forEach(tr => table.appendChild(tr));        
        
    })));
});
