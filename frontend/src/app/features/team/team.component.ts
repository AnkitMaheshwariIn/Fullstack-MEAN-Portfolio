import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamService } from './team.service';
import { Team } from './team.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TeamCreateDialogComponent } from './dialogs/team-create-dialog/team-create-dialog.component';
import { TeamEditDialogComponent } from './dialogs/team-edit-dialog/team-edit-dialog.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class TeamComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  totalRecords = 0;
  loading = true;
  selectedTeam: Team | null = null;
  teamEventsSubscription: Subscription | null = null;

  constructor(
    private teamService: TeamService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.subscribeToTeamEvents();
  }

  ngOnDestroy(): void {
    if (this.teamEventsSubscription) {
      this.teamEventsSubscription.unsubscribe();
    }
  }

  loadTeams(page: number = 1, search: string = ''): void {
    this.loading = true;
    this.teamService.getTeams(page, 10, search).subscribe({
      next: (response) => {
        this.teams = response.teams;
        this.totalRecords = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load teams'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialogService.open(TeamCreateDialogComponent, {
      header: 'Create New Team',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' }
    });

    ref.onClose.subscribe((team: Team | undefined) => {
      if (team) {
        this.teams.unshift(team);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Team created successfully'
        });
      }
    });
  }

  openEditDialog(team: Team): void {
    const ref = this.dialogService.open(TeamEditDialogComponent, {
      header: 'Edit Team',
      width: '70%',
      data: { team }
    });

    ref.onClose.subscribe((updatedTeam: Team | undefined) => {
      if (updatedTeam) {
        const index = this.teams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          this.teams[index] = updatedTeam;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Team updated successfully'
          });
        }
      }
    });
  }

  deleteTeam(team: Team): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this team?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.teamService.deleteTeam(team.id).subscribe({
          next: () => {
            this.teams = this.teams.filter(t => t.id !== team.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Team deleted successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete team'
            });
          }
        });
      }
    });
  }

  private subscribeToTeamEvents(): void {
    this.teamEventsSubscription = this.teamService.listenForTeamEvents().subscribe({
      next: (event) => {
        switch (event.type) {
          case 'created':
            this.teams.unshift(event.data);
            this.messageService.add({
              severity: 'info',
              summary: 'New Team',
              detail: 'A new team has been created'
            });
            break;
          case 'updated':
            const index = this.teams.findIndex(t => t.id === event.data.teamId);
            if (index !== -1) {
              this.teams[index] = event.data;
              this.messageService.add({
                severity: 'info',
                summary: 'Team Updated',
                detail: 'Team has been updated'
              });
            }
            break;
          case 'deleted':
            this.teams = this.teams.filter(t => t.id !== event.data.teamId);
            this.messageService.add({
              severity: 'info',
              summary: 'Team Deleted',
              detail: 'Team has been deleted'
            });
            break;
        }
      }
    });
  }
}
