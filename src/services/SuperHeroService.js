import { useCallback } from "react";
import { useHttp } from "../hooks/http.hook";
import { _apiBase } from "../resources/apiKey";

const _baseOffset = 1;
const _pageLimit = 9;
const _maxCharacterId = 731;

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
		["Full name", biography.fullName],
		["Publisher", biography.publisher],
		["Alignment", biography.alignment],
		["First appearance", biography.firstAppearance],
		["Place of birth", biography.placeOfBirth],
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
	const fullName = normalizeValue(biography.fullName);
	const firstAppearance = normalizeValue(biography.firstAppearance);
	const publisher = normalizeValue(biography.publisher);

	return [
		fullName && `${char.name}'s full name is ${fullName}`,
		firstAppearance && `First appeared in ${firstAppearance}`,
		publisher && `Publisher: ${publisher}`,
	].filter(Boolean).join(". ");
};

const useSuperHeroService = () => {
	const { loading, request, error, clearError, setError } = useHttp();

	const throwApiError = useCallback((message) => {
		setError(message);
		throw new Error(message);
	}, [setError]);

	const _transformCharacter = useCallback((char) => {
		const fullDescription = createDescription(char);
		const imageUrl = char.images?.md || char.images?.lg || char.images?.sm || char.images?.xs;
		
		return {
			id: Number(char.id),
			name: char.name,
			description: trimText(fullDescription),
			fullDescription: fullDescription || "There is no biography information for this character",
			thumbnail: imageUrl || "https://placehold.co/300x300?text=No+Image",
			homepage: "https://akabab.github.io/superhero-api/api/",
			wiki: `https://akabab.github.io/superhero-api/api/id/${char.id}.json`,
			details: createDetails(char),
		};
	}, []);

	const getResource = useCallback(async (endpoint) => {
		console.log(`Fetching resource from endpoint: ${endpoint}`);
		console.log(`Full URL: ${_apiBase}${endpoint}`);
		const res = await request(`${_apiBase}${endpoint}`);

		if (res.response === "error") {
			throwApiError(res.error || "Superhero API request failed");
		}

		return res;
	}, [request, throwApiError]);

	const getAllCharacters = useCallback(async (offset = _baseOffset) => {
		let lastError = null;
		const ids = Array.from({ length: _pageLimit }, (_, i) => offset + i)
			.filter(id => id <= _maxCharacterId);

		const results = await Promise.all(
			ids.map(async (id) => {
				try {
					const res = await getResource(`/id/${id}.json`);
					return _transformCharacter(res);
				} catch (e) {
					lastError = e;
					return null;
				}
			})
		);

		const characters = results.filter(Boolean);

		if (!characters.length) {
			throwApiError(lastError?.message || "No characters were loaded from the superhero API");
		}

		return characters;
	}, [_transformCharacter, getResource, throwApiError]);

	const getCharacterByName = useCallback(async (name) => {
		const res = await getResource(`/search/${encodeURIComponent(name.trim())}`);

		if (res.response === "error") {
			const apiError = res.error || "";
			if (apiError.toLowerCase().includes("not found")) {
				return [];
			}
			throwApiError(apiError || "SuperHero API search failed");
		}

		return res.results.map(_transformCharacter);
	}, [_transformCharacter, getResource, throwApiError]);

	const getCharacter = useCallback(async (id) => {
		const res = await getResource(`/id/${id}.json`);
		return _transformCharacter(res);
	}, [_transformCharacter, getResource]);

	const getRandomCharacter = useCallback(async () => {
		const id = Math.floor(Math.random() * _maxCharacterId) + 1;
		let character = null;
		try {
			character = await getCharacter(id);
		} catch (e) {
			throwApiError(`Failed to fetch character with ID ${id}: ${e.message}`);
		}
		return character;
	}, [getCharacter, throwApiError]);

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
