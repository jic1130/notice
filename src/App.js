import { useEffect, useState } from "react"; // React에서 제공하는 훅(hook)으로, 상태(state)와 효과(effect)를 관리
import "./App.css"; // 외부 CSS 파일 불러오기
import axios from "axios"; // HTTP 요청을 처리하기 위한 라이브러리

function App() {
  // 상태 변수 정의 (React의 useState 훅 사용)
  const [datas, setDatas] = useState([]); // 모든 문서를 저장하는 배열
  const [inputTitle, setInputTitle] = useState(""); // 수정할 문서의 제목
  const [inputContent, setInputContent] = useState(""); // 수정할 문서의 내용
  const [selectedId, setSelectedId] = useState(null); // 선택된 문서의 ID
  const [newInputTitle, setNewInputTitle] = useState(""); // 새로 작성할 문서의 제목
  const [newInputContent, setNewInputContent] = useState(""); // 새로 작성할 문서의 내용
  const [createToggle, setCreateToggle] = useState(false); // 새 문서를 작성하는 화면을 보여줄지 결정
  const [searchQuery, setSearchQuery] = useState(""); // 검색창에 입력된 검색어

  const local = "http://localhost:4000"
  const glitch = "https://rapid-vivacious-light.glitch.me"


  // 문서 목록을 처음 앱이 시작할 때 불러옴
  useEffect(() => {
    const getAllText = async () => {
      try {
        // 서버로부터 모든 문서를 가져옴
        const response = await axios.get(`${glitch}/post`);
        setDatas(response.data); // 가져온 데이터를 상태 변수에 저장
      } catch (error) {
        console.error("문서를 불러오는 데 실패했습니다.", error); // 에러가 발생했을 때 콘솔에 출력
      }
    };
    getAllText(); // 함수 실행
  }, []); // 빈 배열을 넣으면 컴포넌트가 처음 렌더링될 때만 실행

  // 문서를 수정하는 함수
  const updateText = async (id, name, contents) => {
    try {
      const body = { name, contents, isDeleted: false }; // 수정할 문서의 제목과 내용을 서버로 보낼 데이터로 준비
      await axios.patch(`${local}/post/${id}`, body); // 서버에 PATCH 요청으로 데이터 업데이트
      const response = await axios.get(`${glitch}/post`); // 수정된 데이터를 다시 서버에서 가져옴
      setDatas(response.data); // 최신 데이터를 상태 변수에 저장
      setInputTitle(""); // 제목 입력창 초기화
      setInputContent(""); // 내용 입력창 초기화
      setSelectedId(null); // 선택된 문서를 초기화 (수정 화면 닫기)
    } catch (error) {
      console.error("문서 수정에 실패했습니다.", error); // 에러가 발생하면 콘솔에 출력
    }
  };

  // 새로운 문서를 작성하는 함수
  const createText = async (name, contents) => {
    try {
      const body = { name, contents, isDeleted: false }; // 새로 작성할 문서의 제목과 내용을 서버로 보낼 데이터로 준비
      await axios.post(`${local}/post`, body); // 서버에 POST 요청으로 데이터 추가
      const response = await axios.get(`${glitch}/post`); // 추가된 데이터를 포함한 최신 데이터를 가져옴
      setDatas(response.data); // 상태 변수에 저장
      setNewInputTitle(""); // 제목 입력창 초기화
      setNewInputContent(""); // 내용 입력창 초기화
      setCreateToggle(false); // 작성 화면 닫기
    } catch (error) {
      console.error("문서 작성에 실패했습니다.", error); // 에러가 발생하면 콘솔에 출력
    }
  };

  // 문서를 수정하려고 선택했을 때 호출되는 함수
  const handleEdit = (id) => {
    const selectedDoc = datas.find((doc) => doc.id === id); // 선택한 문서를 목록에서 찾음
    if (selectedDoc) {
      setSelectedId(id); // 선택된 문서의 ID 저장
      setInputTitle(selectedDoc.name); // 선택된 문서의 제목을 입력창에 표시
      setInputContent(selectedDoc.contents); // 선택된 문서의 내용을 입력창에 표시
    }
  };


  const handleDelete = async (text) => {
    try {
      await axios.patch(`${glitch}/post/${text.id}`,{
        ...text,
        isDeleted: true
      });
      window.location.reload();
    } catch(error) {
        alert("글 삭제 중 에러가 발생했습니다.")
    }
  }


  // 검색어에 맞는 문서만 필터링
  const filteredDatas = datas.filter((doc) => {
    return (
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || // 제목에 검색어가 포함되어 있는지 확인
      doc.contents.toLowerCase().includes(searchQuery.toLowerCase()) // 내용에 검색어가 포함되어 있는지 확인
    );
  });



///////////////////////////////////////////------------------------------//////////////////////////////////////////////////

//HTML 코드
  return (
    <div className="container"> {/* 전체 화면 컨테이너 */}
      <button onClick={() => setCreateToggle(true)} style={{ marginBottom: '20px' }}>게시글 등록</button> {/* 새 문서를 작성하는 버튼 */}

      {/* 검색창 */}
      {!createToggle && !selectedId && (
        <div className="search-container">
          <input
            type="text"
            value={searchQuery} // 검색어 상태와 연결
            onChange={(e) => setSearchQuery(e.target.value)} // 입력값이 변경되면 상태 업데이트
            placeholder="게시글 검색..." // 입력창 힌트
          />
        </div>
      )}

      {/* 문서 목록 표시! */}
      {!createToggle && !selectedId && (
        <div className="documents-container">
          <h1>게시글 목록</h1>
          {filteredDatas.length > 0 ? ( // 검색 결과가 있으면 문서 목록 표시
            filteredDatas.filter((text) => text.isDeleted === false).map((text) => (
              <div key={text.id} className="document"> {/* 각각의 문서 */}
                <div className="document-title">{text.name}</div> {/* 문서 제목 */}
                <div className="document-content">{text.contents}</div> {/* 문서 내용 */}
                <button onClick={() => handleEdit(text.id)}>수정하기</button> {/* 수정 버튼 */}
                <button onClick={() => handleDelete(text)}>삭제하기</button>
              </div>
            ))
          ) : (
            <div>검색 결과가 없습니다.</div> // 검색 결과가 없으면 메시지 표시
          )}
        </div>
      )}

      {/* 문서 수정 화면 */}
      {selectedId && (
        <div className="edit-container">
          <h2>게시글 수정</h2>
          <input
            type="text"
            value={inputTitle} // 입력창에 제목 표시
            onChange={(e) => setInputTitle(e.target.value)} // 제목 입력값 변경
            placeholder="수정할 제목을 입력하세요" // 입력창 힌트
          />
          <textarea
            value={inputContent} // 입력창에 내용 표시
            onChange={(e) => setInputContent(e.target.value)} // 내용 입력값 변경
            placeholder="수정할 내용을 입력하세요" // 입력창 힌트
            rows="4"
            cols="50"
          />
          <button
            onClick={() => updateText(selectedId, inputTitle, inputContent)} // 수정 완료 버튼
          >
            제목 및 내용 수정
          </button>
          <button onClick={() => setSelectedId(null)} className="close-button">취소</button> {/* 수정 취소 버튼 */}
        </div>
      )}

      {/* 새 문서 작성 화면 */}
      {createToggle && (
        <div className="edit-container">
          <h2>새 게시글 작성</h2>
          <input
            type="text"
            value={newInputTitle} // 새 문서 제목 입력값과 연결
            onChange={(e) => setNewInputTitle(e.target.value)} // 제목 입력값 변경
            placeholder="제목을 입력하세요" // 입력창 힌트
          />
          <textarea
            value={newInputContent} // 새 문서 내용 입력값과 연결
            onChange={(e) => setNewInputContent(e.target.value)} // 내용 입력값 변경
            placeholder="내용을 입력하세요" // 입력창 힌트
            rows="4"
            cols="50"
          />
          <button onClick={() => createText(newInputTitle, newInputContent)}>게시글 작성</button> {/* 문서 작성 완료 버튼 */}
          <button onClick={() => setCreateToggle(false)} className="close-button">닫기</button> {/* 작성 화면 닫기 버튼 */}
        </div>
      )}
    </div>
  );
}

export default App; // App 컴포넌트를 내보내서 다른 파일에서 사용할 수 있게 함
