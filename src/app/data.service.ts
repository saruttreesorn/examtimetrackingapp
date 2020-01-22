import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from '../models/note.interface';
import { AngularFireAuth } from '@angular/fire/auth';



@Injectable({
  providedIn: 'root'
})
export class DataService {
  private notesCollection: AngularFirestoreCollection<Note>;
  // notes$: Observable<Note[]>;
  public notes$ = new BehaviorSubject<Note[]>([]);
  private uid: string;
  private authStatus: Subscription;

  constructor(private afs: AngularFirestore, private afauth: AngularFireAuth) {
    // get the user auth status
    this.authStatus = afauth.authState.subscribe((user) => {
      if (user) {
        // get the user id
        this.uid = user.uid;
        // create path
        const path = `notes/${this.uid}/usernotes`;
        // set the collection
        this.notesCollection = afs.collection<Note>(path);
        // this.notes$ = this.getNotes();
        this.getNotes().subscribe((data) => {
          this.notes$.next(data);
        });
      }
    });
  }

  addNote(data: Note) {
    this.notesCollection.add(data);
  }

  getNotes() {
    return this.notesCollection.snapshotChanges()
      .pipe( map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Note;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }
}
