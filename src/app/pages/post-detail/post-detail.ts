import { Component } from '@angular/core';
import { CommentsService } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/posts.services';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../models/comment.model';
import { PostCardComponent } from '../../components/post-card/post-card';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule, FormsModule, PostCardComponent],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail {

post: any;
  comments: any[] = [];
  newComment = "";
  page = 1;
  limit = 5;
  hasMore = true;

  
  constructor(
    private route: ActivatedRoute,
    private postService: PostsService,
    private commentService: CommentsService,
    private authService: AuthService
  ) {}
  

  userId: string | null = null;

  ngOnInit() {
    this.userId = this.authService.getUserId();
    const id = this.route.snapshot.paramMap.get("id");
    if (id){
    this.loadPost(id);
    this.loadComments(id);
    }
    
  }

  loadPost(id: string) {
    this.postService.getPostById(id).subscribe(p => this.post = p);
  }

  loadComments(id: string) {
    this.commentService.getComments(id, this.page, this.limit).subscribe((resp: any) => {
      this.comments = [...this.comments, ...resp.comments];
      if (resp.comments.length < this.limit) this.hasMore = false;  
    });
  }

  loadMore() {
    this.page++;
    this.loadComments(this.post._id);
  }

  addComment() {
    if (!this.newComment.trim()) return;
    this.commentService.addComment(this.post._id, this.newComment).subscribe(c => {
      this.comments.unshift(c);
      this.newComment = "";
    });
  }

  enableEdit(comment: Comment) {
    comment.editing = true;
  }

  saveEdit(comment: Comment) {
    this.commentService.updateComment(comment._id, comment.content).subscribe(c => {
      comment.editing = false;
      comment.updatedAt = new Date();
    });
  }
}
