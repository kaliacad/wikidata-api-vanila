document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTerm = document.getElementById("searchQuery").value.trim();

    if (!searchTerm) {
      alert("Please enter a search term: this doesn't have to be empty");
      return;
    }

    showLoadingIndicator();

    const searchEndpoint = "https://www.wikidata.org/w/api.php";
    const searchParams = {
      origin: "*",
      action: "wbsearchentities",
      format: "json",
      search: searchTerm,
      limit: "max",
      language: "en",
    };

    const queryString = new URLSearchParams(searchParams).toString();

    fetch(`${searchEndpoint}?${queryString}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const ids = data.search.map((item) => item.id).join("|");
        console.log(ids);
        fetchEntityDetails(ids);
      })
      .catch((error) => {
        console.error("Search request error:", error);
        alert("An error occurred while searching.");
        hideLoadingIndicator();
      });
  });

function fetchEntityDetails(ids) {
  const detailsEndpoint = "https://www.wikidata.org/w/api.php";
  const detailsParams = {
    origin: "*",
    action: "wbgetentities",
    ids: ids,
    format: "json",
    props:
      "info|claims|descriptions|sitelinks/urls|aliases|labels|datatype|datavalue",
  };

  const queryString = new URLSearchParams(detailsParams).toString();

  fetch(`${detailsEndpoint}?${queryString}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      hideLoadingIndicator();
      return handleEntityDetails(data.entities);
    })
    .catch((error) => {
      console.error("Details request error:", error);
      alert("An error occurred while fetching details.");
      hideLoadingIndicator();
    });
}

function handleEntityDetails(entities) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  if (entities) {
    Object.values(entities).forEach((entity) => {
      entity.labels.en && displayResult(entity);
    });
  } else {
    resultsContainer.innerHTML = "No results found.";
  }
}

function displayResult(entity) {
  const resultsContainer = document.getElementById("results");
  const resultDiv = document.createElement("div");
  resultDiv.className = "result";

  const resultText = document.createElement("div");

  const label = document.createElement("strong");
  label.textContent = entity.labels.en.value + ": ";
  resultText.appendChild(label);

  if (entity.descriptions?.en) {
    const description = document.createTextNode(entity.descriptions.en.value);
    resultText.appendChild(description);
  }

  const link = document.createElement("a");
  link.href = `https://www.wikidata.org/wiki/${entity.id}`;
  link.textContent = "View on Wikidata";
  link.target = "_blank";

  resultText.append(document.createElement("br"), link);

  resultDiv.appendChild(resultText);

  if (entity.claims?.P18?.length > 0) {
    const imageFileName = entity.claims.P18[0].mainsnak.datavalue.value;
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${imageFileName}`;
    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = entity.labels.en.value;
    resultDiv.appendChild(image);
  } else {
    const image = document.createElement("img");
    image.src = "images/empty.jpeg";
    image.alt = entity.labels?.en?.value;
    resultDiv.appendChild(image);
  }

  resultsContainer.appendChild(resultDiv);
}

function showLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "block";
}

function hideLoadingIndicator() {
  document.getElementById("loadingIndicator").style.display = "none";
}
