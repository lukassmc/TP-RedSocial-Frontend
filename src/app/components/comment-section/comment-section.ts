import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentsService } from '../../services/comments.service';
import { Comment } from '../../models/comment.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { take } from 'rxjs';


@Component({
  selector: 'app-comment-section',
  imports: [CommonModule, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './comment-section.html',
  styleUrls: ['./comment-section.css']
})
export class CommentSection implements OnInit {
  @Input() postId!: string;
  @Output() commentAdded = new EventEmitter<void>();
  commentForm!: FormGroup;
  comments: Comment[] = [];
  loading = false;
  errorMsg = '';

  constructor(private commentsService: CommentsService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });

    this.loadComments();
  }

  loadComments() {
    if (!this.postId) return;
    this.loading = true;
    this.commentsService.getComments(this.postId)
      .pipe(take(1))
      .subscribe({
        next: comments => {
          this.comments = comments;
          this.loading = false;
        },
        error: err => {
          console.error('Error cargando comentarios', err);
          this.loading = false;
        }
      });
  }

  addComment() {
    if (this.commentForm.invalid) return;

    this.commentsService.addComment(this.postId, this.commentForm.value.content)
      .pipe(take(1))
      .subscribe({
        next: comment => {
          this.comments.push(comment);
          this.commentForm.reset();

           this.commentAdded.emit();
        },
        error: err => {
          console.error('Error al agregar comentario', err);
          this.errorMsg = 'No se pudo agregar el comentario';
        }
      });
  }
}
