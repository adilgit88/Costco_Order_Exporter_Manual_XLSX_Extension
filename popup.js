
document.getElementById("scrape").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const sections = {
        "Online Orders": [],
        "Warehouse Orders": [],
        "Installation Services": []
      };

      document.querySelectorAll("div.order").forEach(order => {
        const sectionTitle = order.closest("section")?.querySelector(".MuiTypography-root")?.textContent.trim();
        const type = order.querySelector("div:nth-child(1)")?.textContent.trim() || "";
        const datetime = order.querySelector("div:nth-child(2)")?.textContent.trim() || "";
        const location = order.querySelector("div:nth-child(3)")?.textContent.trim() || "";
        const total = order.querySelector("div:nth-child(4)")?.textContent.trim() || "";

        if (sections[sectionTitle]) {
          sections[sectionTitle].push({
            Type: type,
            Date: datetime,
            Location: location,
            Total: total
          });
        }
      });

      return sections;
    }
  }, (results) => {
    const data = results[0].result;
    const wb = XLSX.utils.book_new();

    Object.keys(data).forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(data[sheet]);
      XLSX.utils.book_append_sheet(wb, ws, sheet);
    });

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;

    const blob = new Blob([buf], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.getElementById("download");
    link.href = url;
    link.style.display = "inline-block";
  });
});
