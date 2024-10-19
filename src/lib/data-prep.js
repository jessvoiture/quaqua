import { rollup, max, mean, min } from 'd3-array';

export function sortAlbums(data) {
	// Sorting by days_since_min_release_date
	const artistsSortedByDebutDateArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist)) {
				acc.set(album.artist, album.days_since_min_release_date);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => a[1] - b[1])
		.map(([artist]) => artist);

	// Sorting by days_since_first_release (days active)
	const artistsSortedByDaysActiveArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist) || acc.get(album.artist) < album.days_since_first_release) {
				acc.set(album.artist, album.days_since_first_release);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => b[1] - a[1])
		.map(([artist]) => artist);

	// Define the Y positions by debut release date
	const yPositionsDebut = new Map(
		artistsSortedByDebutDateArray.map((artist, index) => [artist, index + 1])
	);

	// Define the Y positions by days active
	const yPositionsActive = new Map(
		artistsSortedByDaysActiveArray.map((artist, index) => [artist, index + 1])
	);

	// Merge data with yPositionsDebut and yPositionsActive
	const albumsSorted = data.map((album) => ({
		...album,
		indexByDebutDate: yPositionsDebut.get(album.artist),
		indexByDaysActive: yPositionsActive.get(album.artist)
	}));

	return albumsSorted;
}

export function sortArtists(data) {
	// Calculate Y positions directly in this function

	// Sorting by days_since_min_release_date for debut date positioning
	const artistsSortedByDebutDateArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist)) {
				acc.set(album.artist, album.days_since_min_release_date);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => a[1] - b[1])
		.map(([artist]) => artist);

	// Sorting by days_since_first_release (days active) for active positioning
	const artistsSortedByDaysActiveArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist) || acc.get(album.artist) < album.days_since_first_release) {
				acc.set(album.artist, album.days_since_first_release);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => b[1] - a[1])
		.map(([artist]) => artist);

	const yPositionsDebut = new Map(
		artistsSortedByDebutDateArray.map((artist, index) => [artist, index + 1])
	);

	const yPositionsActive = new Map(
		artistsSortedByDaysActiveArray.map((artist, index) => [artist, index + 1])
	);

	// Aggregate data by artist
	const artistStats = rollup(
		data,
		(v) => ({
			count: v.length, // Count the number of albums
			maxDaysSinceFirstRelease: max(v, (d) => d.days_since_first_release), // Max days active
			minDaysSinceMinReleaseDate: min(v, (d) => d.days_since_min_release_date), // min days since the earliest release date of all the artists
			maxDaysSinceMinReleaseDate: max(v, (d) => d.days_since_min_release_date), // max days since the earliest release date of all the artists
			avgDaysSinceLastRelease: mean(
				v.filter((d) => d.days_since_last_release !== 0),
				(d) => d.days_since_last_release
			) // Exclude 0 values
		}),
		(d) => d.artist
	);

	// Convert the Map to an array of objects for easier use
	const artists = Array.from(artistStats, ([artist, stats]) => ({
		artist,
		albumCount: stats.count,
		maxDaysSinceFirstRelease: stats.maxDaysSinceFirstRelease,
		minDaysSinceMinReleaseDate: stats.minDaysSinceMinReleaseDate,
		maxDaysSinceMinReleaseDate: stats.maxDaysSinceMinReleaseDate,
		avgDaysSinceLastRelease: stats.avgDaysSinceLastRelease,
		eraLength: stats.maxDaysSinceFirstRelease / stats.count
	}));

	const yPositionEraLength = new Map(
		[...artists]
			// .sort((a, b) => b.eraLength - a.eraLength) // Sort by eraLength descending
			.sort((a, b) => b.avgDaysSinceLastRelease - a.avgDaysSinceLastRelease) // Sort by eraLength descending
			.map((item, index) => [item.artist, index + 1]) // Map artist to rank
	);

	const artistsSorted = artists.map((d) => ({
		...d,
		indexByDaysActive: yPositionsActive.get(d.artist),
		indexByDebutDate: yPositionsDebut.get(d.artist),
		indexByEraLength: yPositionEraLength.get(d.artist)
	}));

	return artistsSorted;
}

export function flattenData(data) {
	// Transform data so albums are not nested under artist
	const flattenedArtists = data.flatMap((artistEntry) =>
		artistEntry.albums.map((album) => ({
			artist: artistEntry.artist,
			album: album.album,
			album_release_date: album.album_release_date,
			type: album.type,
			first_album_release_date: album.first_album_release_date,
			days_since_first_release: album.days_since_first_release,
			days_since_last_release: album.days_since_last_release,
			notes: album.notes
		}))
	);

	// Find the earliest release date of an album
	const minReleaseDate = new Date(
		Math.min(...flattenedArtists.map((album) => new Date(album.album_release_date)))
	);

	// Add days_since_min_release_date to each object in the flattened data
	const flattened = flattenedArtists.map((album) => {
		const albumReleaseDate = new Date(album.album_release_date);

		const daysSinceMinReleaseDate = Math.floor(
			(albumReleaseDate - minReleaseDate) / (1000 * 60 * 60 * 24)
		);

		return {
			...album,
			days_since_min_release_date: daysSinceMinReleaseDate
		};
	});

	return flattened;
}
