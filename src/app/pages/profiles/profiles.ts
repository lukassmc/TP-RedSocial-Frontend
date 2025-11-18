import { Component, OnInit } from '@angular/core';
import { PostsService } from '../.././services/posts.services';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../../models/post.model';
import { PostCardComponent } from '../../components/post-card/post-card';
import { CommonModule } from '@angular/common';


interface UserProfile {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  profilePicture?: string;
  birthdate: string;
  role: string;
  
}

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, PostCardComponent],
  templateUrl: './profiles.html',
  styleUrl: './profiles.css',
})
export class Profiles implements OnInit {

  user: UserProfile | null = null;

  userPosts: Post[] = [];
  loadingPosts: boolean = false;
  error : string = '';


  totalPosts= 0;
  totalLikes = 0;

  constructor(
    private authService: AuthService,
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
      this.loadUserData();
      this.loadUserPosts();
  }

  public loadUserData(): void {

    const currentUser= this.authService.getCurrentUser();

    if( currentUser){
      this.user= {
         _id: currentUser._id,
        nombre: currentUser.nombre,
        apellido: currentUser.apellido,
        email: currentUser.email,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        birthdate: currentUser.birthdate,
        role: currentUser.role
      }
    }
  }

    public loadUserPosts(): void {
    this.loadingPosts = true;
    this.error = '';

    this.postsService.getMyPosts(3).subscribe({
      next: (post) => {
        this.userPosts = post.posts;
        this.calculateStats();
        this.loadingPosts = false;

      },

    })
  }
  
  private calculateStats(): void {
  this.totalPosts = this.userPosts.length;

  this.totalLikes = this.userPosts.reduce((total, post) => {return total + post.likes.length; }, 0);
  }

  onDeletePost(postId: string) : void {
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.userPosts = this.userPosts.filter(post => post._id !== postId)
        this.calculateStats();
      },
       error: (err) => {
        console.error('Error eliminando post:', err);
        alert('Error al eliminar la publicación');
      }
    })
  }

  get age(): number {
    if (!this.user?.birthdate) return 0;
    
    const birthDate = new Date(this.user.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

    get formattedBirthdate(): string {
    if (!this.user?.birthdate) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(this.user.birthdate).toLocaleDateString('es-ES', options);
  }
}
