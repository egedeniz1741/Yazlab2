
export interface Movie {
    id: number;
    title: string;
    overview: string;
    posterPath: string;
    releaseDate: string;
    voteAverage: number;
}

export interface Book {
    id: string; 
    title: string;
    authors: string[];
    description: string;
    coverUrl: string;
    pageCount: number;
    publishedDate: string;
}