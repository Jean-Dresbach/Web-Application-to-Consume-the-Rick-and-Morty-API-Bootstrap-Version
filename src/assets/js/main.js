const WrapperCards = document.getElementById("wrapper-cards");
const buttonPrev = document.getElementById("prevButton");
const buttonNext = document.getElementById("nextButton");
const searchButton = document.getElementById("search-button");
const searchInputEl = document.getElementById("search-input");
const totalOfPagesEl = document.getElementById("total-of-pages");
const currentPageViewEl = document.getElementById("current-page");
const totalOfCharactersEl = document.getElementById("total-of-characters");
const totalOfLocationsEl = document.getElementById("total-of-locations");
const totalOfEpisodesEl = document.getElementById("total-of-episodes");

const PER_PAGE = 6;
let characterName = "";
let totalOfCharacters;
let currentPage = 1;
let currentPageView = Number(currentPageViewEl.innerText);
let characters = [];
let charactersView = [];

searchButton.addEventListener('click', (e) => {
  e.preventDefault();
  
  setCurrentPageView(1);
  
  characters = [];
  charactersView = [];

  characterName = searchInputEl.value;
  currentPage = 1

  fetchCharacters();
  fetchFooterInfo();
  setView();
})

function resetCards() {
  WrapperCards.innerHTML = "";
}

function setCurrentPageView(newPage) {
  currentPageView = newPage;
  
  currentPageViewEl.innerHTML = newPage;
}

function setFooterInfo(totalOfCharacters, totalOfLocations, totalOfEpisodes) {
  totalOfCharactersEl.innerHTML = totalOfCharacters;
  totalOfLocationsEl.innerHTML = totalOfLocations;
  totalOfEpisodesEl.innerHTML = totalOfEpisodes;
}

function addDetailedCharacterModal(character, lastEpisodeName) {
  const modal = document.createElement("div");
  modal.classList.add("modal", "fade");
  modal.setAttribute("tabindex", -1);
  modal.setAttribute("id", `modal-${character.id}`);
  modal.setAttribute("data-bs-backdrop", "static");
  modal.setAttribute("data-bs-keyboard", false);

  let status;
  if (character.status === "unknown") {
    status = "Unknown";
  } else {
    status = character.status;
  }

  let ORIGIN;
  if (character.origin.name === "unknown") {
    ORIGIN = "Unknown";
  } else {
    ORIGIN = character.origin.name;
  }

  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content modal-container overflow-hidden">
        <div class="screen-effect"></div>
        <div class="modal-header d-flex flex-column align-items-start">
          <h2 class="modal-title fs-3" id="staticBackdropLabel">${character.name}</h2>
          <p class="m-0">${character.type}</p>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <div class="row m-0 mb-3 justify-content-center">
            <img class="img-fluid w-75 p-0 rounded-3" src="${character.image}" alt="image of ${character.name}">
          </div>
          <div class="d-flex justify-content-center align-items-center m-0 mb-3 gap-2">
            <div class="status ${status}"></div>
            <p class="m-0">${status} - ${character.species} - ${character.gender}</p>
          </div>
          <div class="row m-0 mb-3">
            <h3>Origin</h3>
            <p class="m-0">${ORIGIN}</p>
          </div>
          <div class="row m-0 mb-3">
            <h3>Last known location</h3>
            <p class="m-0">${character.location.name}</p>
          </div>
          <div class="row m-0">
            <h3>Last seen in</h3>
            <p class="m-0">${lastEpisodeName}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  WrapperCards.appendChild(modal);
}

function addCard(character) {
  const card = document.createElement("div")
  card.classList.add("character-card")
  card.setAttribute("data-bs-toggle", "modal");
  card.setAttribute("data-bs-target", `#modal-${character.id}`);

  let status;
  if (character.status === "unknown") {
    status = "Unknown";
  } else {
    status = character.status;
  }

  card.innerHTML += `
  <div class="character-card-image-wrapper">
      <img src="${character.image}" alt="image of ${character.name}">
  </div>
  <div class="character-card-content-wrapper">
    <h2>${character.name}</h2>
    <div>
      <div class="status ${status}"></div>
      <p>${status} - ${character.species}</p>
    </div>
  </div>
  `;

  WrapperCards.appendChild(card)
}

function disableButtons() {
  if (currentPageView < Math.ceil(totalOfCharacters/6)) {
    buttonNext.disabled = false;
    buttonNext.classList.remove("disabled");
  } else  {
    buttonNext.disabled = true;
    buttonNext.classList.add("disabled");
  }

  if (currentPageView > 1) {
    buttonPrev.disabled = false;
    buttonPrev.classList.remove("disabled");
  } else {
    buttonPrev.disabled = true;
    buttonPrev.classList.add("disabled");
  }
}

async function getLastEpisodeName(character) {
  try {
    const episodeURL = (character.episode[character.episode.length - 1]);

    const { data } = await api.get(`${episodeURL}`);
    
    return data.name

  } catch (error) {
    console.log(`Error when trying to get the episode name: ${error}`);
  }
}

async function fetchCharacters() {
  try {
    const { data } = await api.get("/character?page=" + currentPage + "&name=" + characterName);

    characters.push(...data.results);

  } catch (error) {
    console.log(`Error when trying to get the characters: ${error}`);
  }
}

async function setView() {
  console.log(currentPageView);
  charactersView = characters.slice(
    (currentPageView - 1) * PER_PAGE,
    currentPageView * PER_PAGE
  );

  if (charactersView.length < PER_PAGE) {
    currentPage++;
    await fetchCharacters();

    charactersView = characters.slice(
      (currentPageView - 1) * PER_PAGE,
      currentPageView * PER_PAGE
      );
  }

  resetCards();
  disableButtons();

  for (const character of charactersView) {
    const lastEpisodeName = await getLastEpisodeName(character);
    
    addCard(character);
    addDetailedCharacterModal(character, lastEpisodeName)
  }
}

async function fetchFooterInfo() {
  try {
    const responseCharacter = await api.get("/character?name=" + characterName);
    totalOfCharacters = responseCharacter.data.info.count
    totalOfPagesEl.innerHTML = Math.ceil(totalOfCharacters/6)
    
    const responseLocations = await api.get("https://rickandmortyapi.com/api/location");
    const totalOfLocations = responseLocations.data.info.count
    
    const responseEpisodes = await api.get("https://rickandmortyapi.com/api/episode");
    const totalOfEpisodes = responseEpisodes.data.info.count
    
    setFooterInfo(totalOfCharacters, totalOfLocations, totalOfEpisodes)
  
  } catch (error) {
    console.log(`Error when trying to get the footer informations: ${error}`);
  }
}

function nextPage() {
  if (currentPageView < Math.ceil(totalOfCharacters/6)) {
    currentPageView++;

    setCurrentPageView(currentPageView);
      
    setView();
  }
}

function prevPage() {
  if (currentPageView > 1) {
    currentPageView--;
  
    setCurrentPageView(currentPageView);
    
    setView();
  }
}

async function start() {
  fetchFooterInfo()
  await fetchCharacters();
  setView();
}

start();
