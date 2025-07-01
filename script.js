// Load sidebar HTML
fetch('sidebar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('sidebar-container').innerHTML = data;

    // Sidebar toggle handler bind after loading sidebar
    document.body.addEventListener("click", function (e) {
      if (e.target && e.target.matches(".toggle-btn")) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle("closed");

        const main = document.querySelector("main");
        if (main) main.classList.toggle("collapsed");
      }
    });
  });
