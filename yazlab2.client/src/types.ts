
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

export interface FeedItem {
    type: "Movie" | "Book";
    contentId: string | number;
    user: string;
    userAvatar: string;
    title: string;
    image: string;
    action: string;
    rating: number | null;
    reviewText?: string; 
    date: string;
    likeCount: number;
    isLiked: boolean;
}