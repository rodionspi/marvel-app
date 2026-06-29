import { useHttp } from "../hooks/http.hook";
import {_apiKey, _apiBase} from "../resources/apiKey";

const useSuperHeroService = () => {
	const { loading, request, error, clearError, setError } = useHttp();
	const _baseOffset = 1;
	const _pageLimit = 9;
	const _maxCharacterId = 731;
	const _tokenPlaceholder = "YOUR_SUPERHERO_API_TOKEN";

	const hasToken = () => _apiKey && _apiKey !== _tokenPlaceholder;

	const throwApiError = (message) => {
		setError(message);
		throw new Error(message);
	};

	const getResource = async (endpoint) => {
		if (!hasToken()) {
			throwApiError(
				"Add your SuperHero API token to REACT_APP_SUPERHERO_API_TOKEN or src/resources/apiKey.js"
			);
		}

		const res = await request(`${_apiBase}${_apiKey}${endpoint}`);

		if (res.response === "error") {
			throwApiError(res.error || "SuperHero API request failed");
		}

		return res;
	};

	const getAllCharacters = async (offset = _baseOffset) => {
		if (!hasToken()) {
			throwApiError(
				"Add your SuperHero API token to REACT_APP_SUPERHERO_API_TOKEN or src/resources/apiKey.js"
			);
		}

		let lastError = null;
		const ids = Array.from({ length: _pageLimit }, (_, i) => offset + i)
			.filter(id => id <= _maxCharacterId);

		const results = await Promise.all(
			ids.map(async (id) => {
				try {
					const res = await getResource(`/${id}`);
					return _transformCharacter(res);
				} catch (e) {
					lastError = e;
					return null;
				}
			})
		);

		const characters = results.filter(Boolean);

		if (!characters.length) {
			throwApiError(lastError?.message || "No characters were loaded from SuperHero API");
		}

		return characters;
	};

	const getCharacterByName = async (name) => {
		if (!hasToken()) {
			throwApiError(
				"Add your SuperHero API token to REACT_APP_SUPERHERO_API_TOKEN or src/resources/apiKey.js"
			);
		}

		const res = await request(
			`${_apiBase}${_apiKey}/search/${encodeURIComponent(name.trim())}`
		);

		if (res.response === "error") {
			const apiError = res.error || "";
			if (apiError.toLowerCase().includes("not found")) {
				return [];
			}
			throwApiError(apiError || "SuperHero API search failed");
		}

		return res.results.map(_transformCharacter);
	};

	const getCharacter = async (id) => {
		const res = await getResource(`/${id}`);
		return _transformCharacter(res);
	};

	const getRandomCharacter = async () => {
		const id = Math.floor(Math.random() * _maxCharacterId) + 1;
		return getCharacter(id);
	};

	const normalizeValue = (value) => {
		if (Array.isArray(value)) {
			return value.map(normalizeValue).filter(Boolean).join(", ");
		}

		if (!value || value === "-" || value === "null") {
			return "";
		}

		return value;
	};

	const trimText = (text, maxLength = 210) => {
		if (!text) {
			return "There is no description for this character";
		}

		return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
	};

	const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

	const createDetails = (char) => {
		const biography = char.biography || {};
		const appearance = char.appearance || {};
		const work = char.work || {};
		const powerstats = char.powerstats || {};

		const bioDetails = [
			["Full name", biography["full-name"]],
			["Publisher", biography.publisher],
			["Alignment", biography.alignment],
			["First appearance", biography["first-appearance"]],
			["Place of birth", biography["place-of-birth"]],
			["Race", appearance.race],
			["Height", appearance.height],
			["Weight", appearance.weight],
			["Occupation", work.occupation],
			["Base", work.base],
		];

		const statsDetails = Object.entries(powerstats)
			.map(([name, value]) => [titleCase(name), value]);

		return [...bioDetails, ...statsDetails]
			.map(([name, value]) => ({ name, value: normalizeValue(value) }))
			.filter(item => item.value);
	};

	const createDescription = (char) => {
		const biography = char.biography || {};
		const fullName = normalizeValue(biography["full-name"]);
		const firstAppearance = normalizeValue(biography["first-appearance"]);
		const publisher = normalizeValue(biography.publisher);

		return [
			fullName && `${char.name}'s full name is ${fullName}`,
			firstAppearance && `First appeared in ${firstAppearance}`,
			publisher && `Publisher: ${publisher}`,
		].filter(Boolean).join(". ");
	};

	const _transformCharacter = (char) => {
		const fullDescription = createDescription(char);
		const superheroDbSearch = `https://www.superherodb.com/search/${encodeURIComponent(char.name)}`;

		return {
			id: Number(char.id),
			name: char.name,
			description: trimText(fullDescription),
			fullDescription: fullDescription || "There is no biography information for this character",
			thumbnail: char.image?.url || "https://placehold.co/300x300?text=No+Image",
			homepage: "https://superheroapi.com/",
			wiki: superheroDbSearch,
			details: createDetails(char),
		};
	};

	return {
		loading,
		error,
		clearError,
		getAllCharacters,
		getCharacterByName,
		getCharacter,
		getRandomCharacter,
	};
};

export default useSuperHeroService;
