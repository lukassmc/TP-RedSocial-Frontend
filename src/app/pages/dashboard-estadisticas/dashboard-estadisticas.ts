import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'; 
import { AuthService } from '../../services/auth.service';


import { ChartConfiguration, ChartType } from 'chart.js';
import { ChartModule } from './chart.module'; 

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule], 
  templateUrl: './dashboard-estadisticas.html',
  styleUrls: ['./dashboard-estadisticas.css']
})
export class DashboardEstadisticasComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  isLoading = true;


  public barChartOptions: ChartConfiguration['options'] = { responsive: true, scales: { y: { beginAtZero: true } } };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Posts por Usuario' }]
  };

 
  public lineChartOptions: ChartConfiguration['options'] = { responsive: true };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Comentarios por Día', borderColor: '#764ba2', fill: false }]
  };

  
  public pieChartOptions: ChartConfiguration['options'] = { responsive: true };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'] }]
  };

  
  
  dateRange = { start: '', end: '' };

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.dateRange.start = thirtyDaysAgo.toISOString().split('T')[0];
    this.dateRange.end = today.toISOString().split('T')[0];

    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    const { start, end } = this.dateRange;

    Promise.all([
      this.fetchPostsByUser(start, end),
      this.fetchCommentsOverTime(start, end),
      this.fetchCommentsPerPost(start, end)
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Error al cargar estadísticas:', error);
      this.isLoading = false;
    });
  }

  
  private fetchPostsByUser(start: string, end: string): Promise<void> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/stats/posts-per-user?startDate=${start}&endDate=${end}`).toPromise().then(data => {
      if (data) {
        this.barChartData.labels = data.map(item => item.username);
        this.barChartData.datasets[0].data = data.map(item => item.postCount);
      }
    });
  }

  private fetchCommentsOverTime(start: string, end: string): Promise<void> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/stats/comments-over-time?startDate=${start}&endDate=${end}`).toPromise().then(data => {
      if (data) {
        this.lineChartData.labels = data.map(item => item._id);
        this.lineChartData.datasets[0].data = data.map(item => item.commentCount);
      }
    });
  }

  private fetchCommentsPerPost(start: string, end: string): Promise<void> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/stats/comments-per-post?startDate=${start}&endDate=${end}`).toPromise().then(data => {
        if (data) {
            
            const validData = data.filter(item => item.commentCount > 0);

          
            this.pieChartData.labels = validData.map(item => item.postTitle);
            this.pieChartData.datasets[0].data = validData.map(item => item.commentCount);
        }
    });
}
get hasPieChartData(): boolean {
    // Devuelve true solo si los datos existen y tienen etiquetas
    return !!(this.pieChartData?.labels && this.pieChartData.labels.length > 0);
  }

}