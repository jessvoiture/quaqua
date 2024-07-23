export const load = async ({ fetch }) => {
	const fetchArtistData = async () => {
		const res = await fetch('/data/artist_active_data.json');
		const data = await res.json();
		return data;
	};

	const artists = await fetchArtistData();

	return {
		artists
	};
};
