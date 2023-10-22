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

function addCard(character, episodeName) {
  const card = document.createElement("div")
  
  card.classList.add("character-card")
  
  let status
  if (character.status === "unknown") {
    status = "Unknown"
  } else {
    status = character.status
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

{/* <div class="character-card-image-wrapper">
      <img src="${character.image}" alt="image of ${character.name}">
  </div>
  <div class="character-card-content-wrapper">
      <section>
          <h2>${character.name}</h2>
          <div>
              <div class="status ${status}"></div>
              <p>${status} - ${character.species}</p>
          </div>
      </section>
      <section>
          <h3>Last known location</h3>
          <p>${character.location.name}</p>
      </section>
      <section>
          <h3>Last seen in</h3>
          <p>${episodeName}</p>
      </section>
  </div> */}


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
    
    addCard(character, lastEpisodeName);
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
