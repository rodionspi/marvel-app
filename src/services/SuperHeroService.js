import { useCallback } from "react";
import { useHttp } from "../hooks/http.hook";
import { _apiBase } from "../resources/apiKey";

const _baseOffset = 1;
const _maxCharacterId = 731;
const _initialFailureLimit = 3;

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
		const res = await request(`${_apiBase}${endpoint}`);

		if (res.response === "error") {
			throwApiError(res.error || "Superhero API request failed");
		}

		return res;
	}, [request, throwApiError]);

	const getAllCharacters = useCallback(async (offset = _baseOffset) => {
		const page = await getResource(`/page/${offset}`);
		const characters = page.characters.map(_transformCharacter);

		if (!characters.length) {
			throwApiError("No characters were loaded from the superhero API");
		}

		return {
			characters,
			nextOffset: page.nextOffset,
			ended: page.ended,
		};
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
		const startId = Number(id);
		let lastError = null;

		for (let shift = 0; shift < _initialFailureLimit; shift += 1) {
			const currentId = startId + shift;

			if (currentId > _maxCharacterId) {
				break;
			}

			try {
				const res = await getResource(`/id/${currentId}.json`);
				return _transformCharacter(res);
			} catch (e) {
				lastError = e;
			}
		}

		throwApiError(`Failed to fetch character with ID ${id}: ${lastError?.message || "unknown error"}`);
	}, [_transformCharacter, getResource, throwApiError]);

	const getRandomCharacter = useCallback(async () => {
		const startId = Math.floor(Math.random() * _maxCharacterId) + 1;

		try {
			return await getCharacter(startId);
		} catch (e) {
			throwApiError(`Failed to fetch random character: ${e.message}`);
		}
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
