let data;

document.addEventListener('DOMContentLoaded', function() {

    const logoutButton = document.getElementById('logout');
    logoutButton.addEventListener("click",
      async () => {
      await fetch("/logout");
      location.href = '/login';
    });

    // Create new grant button
    const grantButton = document.getElementById('newgrant');
    grantButton.addEventListener("click", () => window.location.href = 'http://localhost:3000/')
  
    
    // Sort table by status setup and method
    let sortButtons = document.querySelectorAll("button.sort")
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
      };
    }));

    
    //Get table with all results, then get "due soon" notifications
    getTable("all").then((data) => setNotifications(data));
    async function getTable(sortBy) {
      const response = await fetch(`/grants/data/${sortBy}`)
      data = await response.json();
    
      const tbod = document.getElementById("tbod");
      // Delete the table when created new sorted or unsorted table
      while (tbod.firstChild) {
        tbod.removeChild(tbod.firstChild)
      };

      // Creat a row for the data and assign it the SQLite's rowid
      for (ele of data) {
        const row = document.createElement("tr");
        row.classList.add("row");
        row.id = "row-" + ele.rowid;
        
        // Create the columns for the rows
        function makeRows(data) {
          let col = document.createElement("td");
          col.textContent = data;
          row.appendChild(col);
        
        };

        // Make columns for each rows data
        Object.values(ele).forEach(makeRows);  
        tbod.appendChild(row);
        // Make new variable otherwise JS copies the pointer not the value
        const newId = ele.rowid
        row.addEventListener("click", function(){
          window.location.href = `http://localhost:3000/?grantid=${newId}`
        });
      };

      return data
      
    };

    // Create the "due soon" notifications
    function setNotifications(data){
      const today = new Date()
      for (grant of data){
        const curId = grant.rowid;
        const date = new Date(grant.due_date)
        const daysLeft = Math.round(Math.abs(date - today)/(1000 * 3600 *24))

        if (daysLeft <= 4) {

           const notify =  document.getElementById("notifications");
           const notification = document.createElement("a");
           notification.setAttribute("href", `http://localhost:3000/?grantid=${curId}`);
           notification.classList.add("collection-item");

            (daysLeft === 0) ?
              notification.textContent = `${ele.grant} is due today!`
            : notification.textContent = `${ele.grant} is due in ${daysLeft} days!`;

           notify.appendChild(notification);
        };
      };
    };
    
    

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
