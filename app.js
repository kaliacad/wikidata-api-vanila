document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const searchTerm = document.getElementById("searchQuery").value.trim();

    if (!searchTerm) {
      alert("Please enter a search term.");
      return;
    }

    showLoadingIndicator();

    const endpoint = "https://www.wikidata.org/w/api.php";
    const params = {
      origin: "*",
      action: "wbsearchentities",
      format: "json",
      search: searchTerm,
      limit: 100,
      language: "en",
      props: "labels|descriptions|claims|thumbnail",
      uselang: "en",
      formatversion: "2",
    };

    const queryString = new URLSearchParams(params).toString();

    fetch(`${endpoint}?${queryString}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        hideLoadingIndicator();
        handleSearchResults(data.search);
      })
      .catch((error) => {
        console.error("Request error:", error);
        alert("An error occurred while processing the request.");
        hideLoadingIndicator();
      });
  });

function showLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "block";
}

function hideLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "none";
}

function handleSearchResults(searchResults) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (searchResults && searchResults.length > 0) {
    searchResults.forEach((item) => {
      displayResult(item);
    });
  } else {
    resultsContainer.innerHTML = "No results found.";
  }
}

function displayResult(item) {
  const resultsContainer = document.getElementById("results");
  const resultDiv = document.createElement("div");
  resultDiv.className = "result";

  const label = document.createElement("strong");
  label.textContent = item.label + ": ";
  resultDiv.appendChild(label);

  const description = document.createTextNode(item.description);
  resultDiv.appendChild(description);

  if (item.thumbnail && item.thumbnail.source) {
    const image = document.createElement("img");
    image.src = item.thumbnail.source;
    image.alt = item.label;
    image.style = "max-width: 100%; height: auto; margin-top: 10px;";
    resultDiv.appendChild(document.createElement("br"));
    resultDiv.appendChild(image);
  }

  resultDiv.appendChild(document.createElement("br"));

  const link = document.createElement("a");
  link.href = `https://www.wikidata.org/wiki/${item.id}`;
  link.textContent = "View on Wikidata";
  link.target = "_blank";
  resultDiv.appendChild(link);

  resultsContainer.appendChild(resultDiv);
}
