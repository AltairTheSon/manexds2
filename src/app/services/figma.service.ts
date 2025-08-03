import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FigmaFile {
  document: any;
  components: { [key: string]: any };
  styles: { [key: string]: any };
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  schemaVersion: number;
  mainComponentKey: string;
}

export interface FigmaImageResponse {
  err: string | null;
  images: { [key: string]: string };
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class FigmaService {
  private apiUrl = environment.figmaApiUrl;

  constructor(private http: HttpClient) {}

  // Test Figma connection
  testConnection(accessToken: string): Observable<any> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  // Get Figma file
  getFile(fileId: string, accessToken: string): Observable<FigmaFile> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    return this.http.get<FigmaFile>(`${this.apiUrl}/files/${fileId}`, { headers });
  }

  // Get file images
  getFileImages(fileId: string, nodeIds: string[], accessToken: string): Observable<FigmaImageResponse> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    const params = new HttpParams().set('ids', nodeIds.join(','));
    return this.http.get<FigmaImageResponse>(`${this.apiUrl}/images/${fileId}`, { headers, params });
  }

  // Get file versions
  getFileVersions(fileId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    return this.http.get(`${this.apiUrl}/files/${fileId}/versions`, { headers });
  }

  // Get team projects
  getTeamProjects(teamId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    return this.http.get(`${this.apiUrl}/teams/${teamId}/projects`, { headers });
  }

  // Get project files
  getProjectFiles(projectId: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders().set('X-Figma-Token', accessToken);
    return this.http.get(`${this.apiUrl}/projects/${projectId}/files`, { headers });
  }
}