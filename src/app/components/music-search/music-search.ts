import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-music-search',
  imports: [CommonModule,FormsModule],
  templateUrl: './music-search.html',
  styleUrl: './music-search.css',
})
export class MusicSearch {

  constructor(private musicService : MusicService){}

  @Output() songSelected = new EventEmitter<any>(); 
  
  results: any[] = []
  searchInput= ''
  loading = false

  search(){
    if (!this.searchInput.trim()) return;

    this.loading = true

    this.musicService.searchSongs(this.searchInput).subscribe((res : any) =>{
      this.results = res.results
      this.loading = false
    })
  }

  selectSong(song : any){
    this.songSelected.emit({
    trackName: song.trackName,
    artistName: song.artistName,
    albumName: song.collectionName,
    previewUrl: song.previewUrl,
    artwork: song.artworkUrl100
    })
  }
}
