export type Banner = {
    targetId: number;
    url: string;
    imageUrl: string;
}

export type HotTag = {
    id: number;
    name: string;
    position: number;
}

export type Singer = {
   id: number;
   albumSize: number;
   name: string;
   picUrl: string; 
}

//歌曲
export type Song = {
    id: number;
    name: string;
    url: string;
    ar: Singer[];
    al: { id: number; name: string; picUrl: string };
    dt: number;
}

//歌单
export type SongSheet = {
    id: number;
    playCount: number;
    name: string;
    picUrl: string;
    tracks: Song[];
 }

 // 播放地址
 export type SongUrl = {
     id: number;
     url: string;
 }