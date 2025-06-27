import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../core/services/socket.service';
import { map } from 'rxjs/operators';

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  leader: string;
  status: 'active' | 'inactive' | 'archived';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.apiUrl}/api/teams`;

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {}

  // Create team
  createTeam(teamData: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, teamData);
  }

  // Get team by ID
  getTeam(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/${id}`);
  }

  // Update team
  updateTeam(id: string, teamData: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${id}`, teamData);
  }

  // Delete team
  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all teams with pagination
  getTeams(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Observable<{
    teams: Team[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) {
      params.append('search', search);
    }

    if (status) {
      params.append('status', status);
    }

    return this.http.get(`${this.apiUrl}?${params.toString()}`).pipe(
      map((response: any) => response)
    );
  }

  // Get team members
  getTeamMembers(id: string): Observable<{
    members: TeamMember[];
    leader: TeamMember;
  }> {
    return this.http.get<{
      members: TeamMember[];
      leader: TeamMember;
    }>(`${this.apiUrl}/${id}/members`);
  }

  // Listen for team events
  listenForTeamEvents(): Observable<{ type: string; data: any }> {
    return this.socketService.listenForEvent('team');
  }
}
