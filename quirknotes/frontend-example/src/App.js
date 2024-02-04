import React, {useState, useEffect} from "react"
import './App.css';
import Dialog from "./Dialog";
import Note from "./Note";

function App() {

  // -- Backend-related state --
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState(undefined)

  // -- Dialog props-- 
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogNote, setDialogNote] = useState(null)

  
  // -- Database interaction functions --
  useEffect(() => {
    const getNotes = async () => {
      try {
        await fetch("http://localhost:4000/getAllNotes").then(async (response) => {
          if (!response.ok) {
            console.log("Server failed:", response.status)
          } else {
              await response.json().then((data) => {
              getNoteState(data.response)
          }) 
          }
        })
      } catch (error) {
        console.log("Fetch function failed:", error)
      } finally {
        setLoading(false)
      }
    }

    getNotes()
  }, [])

  // Delete Note 
  const deleteNote = async (entry) => {
    try {
      await fetch("http://localhost:4000/deleteNote/" + entry._id,
          {method: "DELETE",
          headers: { "Content-Type": "application/json" }
        }).then(async (response) => {
          if (!response.ok) {
            alert(`Function Failed`)
            console.log("Server Error:", response.status)
          } else {
            deleteNoteState(entry._id) 
          }
      })
    } catch (error) {
        alert("Error trying to delete note")
        console.log("Fetch function failed:", error)
    }
  }

  // Delete All Notes
  const deleteAllNotes = async () => {
    try {
      const response = await fetch('http://localhost:4000/deleteAllNotes' , {
        method: "DELETE"
      });

      if (!response.ok) {
        console.log("Error: The system has failed to delete all notes", response.status);
        alert('Deleting all notes has failed.')
      } else {
        deleteAllNotesState();
        console.log("All notes have been deleted.")
      }

    } catch (error) {
      console.log("The function to delete all notes has failed and not gone through", error);
      alert('All the notes have failed to delete.');
    }
  }

  
  // -- Dialog functions --
  const editNote = (entry) => {
    setDialogNote(entry)
    setDialogOpen(true)
  }

  const postNote = () => {
    setDialogNote(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogNote(null)
    setDialogOpen(false)
  }

  // -- State modification functions -- 
  const getNoteState = (data) => {
    setNotes(data)
  }

  const postNoteState = (_id, title, content) => {
    setNotes((prevNotes) => [...prevNotes, {_id, title, content}])
  }

  // Modifying state for delete notes 
  const deleteNoteState = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
  }

  // Modifying state for delete all notes 
  const deleteAllNotesState = () => {
    setNotes([]);
  }

  // Modifying state for patching notes
  const patchNoteState = (noteId, newTitle, newContent) => {
    setNotes((prevNotes) => 
      prevNotes.map((note) => 
        note._id === noteId ? { ...note, title: newTitle, content: newContent } : note
      )
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={dialogOpen ? AppStyle.dimBackground : {}}>
          <h1 style={AppStyle.title}>QuirkNotes</h1>
          <h4 style={AppStyle.text}>The best note-taking app ever </h4>

          <div style={AppStyle.notesSection}>
            {loading ?
            <>Loading...</>
            : 
            notes ?
            notes.map((entry) => {
              return (
              <div key={entry._id}>
                <Note
                entry={entry} 
                editNote={editNote} 
                deleteNote={deleteNote}
                />
              </div>
              )
            })
            :
            <div style={AppStyle.notesError}>
              Something has gone horribly wrong!
              We can't get the notes!
            </div>
            }
          </div>

          <button onClick={postNote}>Post Note</button>
          {notes && notes.length > 0 && 
          <button
              onClick={deleteAllNotes}
              >
              Delete All Notes
          </button>}

        </div>

        <Dialog
          open={dialogOpen}
          initialNote={dialogNote}
          closeDialog={closeDialog}
          postNote={postNoteState}
          patchNote={patchNoteState}
          />

      </header>
    </div>
  );
}

export default App;

const AppStyle = {
  dimBackground: {
    opacity: "20%", 
    pointerEvents: "none"
  },
  notesSection: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: "center"
  },
  notesError: {color: "red"},
  title: {
    margin: "0px"
  }, 
  text: {
    margin: "0px"
  }
}