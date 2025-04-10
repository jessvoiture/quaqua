import { sortAlbums, sortArtists, flattenData } from '../lib/data-prep.js';

export const load = async ({ fetch }) => {
	const fetchArtistData = async () => {
		const res = await fetch('/data/artist_active_data.json');
		const data = await res.json();
		return data;
	};

	const artists_all = await fetchArtistData();
	const artists = artists_all.filter((obj) => Number(obj.rank) <= 30);

	const flattenedData = flattenData(artists);
	const albumsSorted = sortAlbums(flattenedData);
	const artistsSorted = sortArtists(flattenedData);

	return {
		artists,
		albumsSorted,
		artistsSorted,
		flattenedData
	};
};
