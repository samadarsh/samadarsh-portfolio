"""
Streamlit frontend for the RAG system.
Provides user interface for document upload and querying.
"""

import streamlit as st
import requests
from pathlib import Path
from typing import List, Dict
import time

# API Configuration
API_BASE_URL = "http://localhost:8000/api/v1"

# Page configuration
st.set_page_config(
    page_title="RAG Document Q&A System",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        margin-bottom: 0.5rem;
    }
    .sub-header {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 2rem;
    }
    .source-box {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .disclaimer {
        background-color: #fff3cd;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #ffc107;
        margin: 1rem 0;
    }
    .success-box {
        background-color: #d4edda;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #28a745;
        margin: 1rem 0;
    }
    .error-box {
        background-color: #f8d7da;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #dc3545;
        margin: 1rem 0;
    }
    </style>
""", unsafe_allow_html=True)


def check_api_health() -> bool:
    """Check if API is running."""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def upload_document(file) -> Dict:
    """Upload document to API."""
    try:
        files = {"file": (file.name, file, file.type)}
        response = requests.post(f"{API_BASE_URL}/upload-documents", files=files, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Upload failed: {str(e)}")
        return None


def query_documents(question: str, top_k: int = 3) -> Dict:
    """Query documents via API."""
    try:
        payload = {
            "question": question,
            "top_k": top_k,
            "include_sources": True
        }
        response = requests.post(f"{API_BASE_URL}/query", json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Query failed: {str(e)}")
        return None


def get_documents() -> Dict:
    """Get list of uploaded documents."""
    try:
        response = requests.get(f"{API_BASE_URL}/documents", timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return None


def delete_document(doc_id: str) -> Dict:
    """Delete a document."""
    try:
        response = requests.delete(f"{API_BASE_URL}/documents/{doc_id}", timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        st.error(f"Delete failed: {str(e)}")
        return None


# Main UI
def main():
    # Header
    st.markdown('<div class="main-header">📚 RAG Document Q&A System</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Upload documents and ask questions - answers grounded in your data</div>', unsafe_allow_html=True)
    
    # Check API health
    if not check_api_health():
        st.error("⚠️ API server is not running. Please start the FastAPI server first.")
        st.code("uvicorn src.api.main:app --reload", language="bash")
        return
    
    # Sidebar for document management
    with st.sidebar:
        st.header("📁 Document Management")
        
        # Get current documents
        docs_response = get_documents()
        
        if docs_response and docs_response.get("success"):
            st.metric("Total Documents", docs_response.get("total_documents", 0))
            st.metric("Total Chunks", docs_response.get("total_chunks", 0))
            
            # List documents
            if docs_response.get("documents"):
                st.subheader("Uploaded Documents")
                for doc in docs_response["documents"]:
                    with st.expander(f"📄 {doc['filename']}"):
                        st.write(f"**Chunks:** {doc['chunks']}")
                        if doc.get('upload_time'):
                            st.write(f"**Uploaded:** {doc['upload_time'][:19]}")
                        
                        if st.button(f"Delete", key=f"delete_{doc['document_id']}"):
                            result = delete_document(doc['document_id'])
                            if result and result.get("success"):
                                st.success("Document deleted!")
                                st.rerun()
        
        st.divider()
        
        # Settings
        st.subheader("⚙️ Settings")
        top_k = st.slider("Number of chunks to retrieve", 1, 10, 3)
        
    # Main content area with tabs
    tab1, tab2 = st.tabs(["💬 Ask Questions", "📤 Upload Documents"])
    
    # Tab 1: Query Interface
    with tab1:
        st.header("Ask Questions About Your Documents")
        
        # Disclaimer
        st.markdown("""
            <div class="disclaimer">
                <strong>ℹ️ Note:</strong> Answers are generated strictly from uploaded documents. 
                The system will indicate if it cannot find relevant information.
            </div>
        """, unsafe_allow_html=True)
        
        # Query input
        question = st.text_area(
            "Enter your question:",
            placeholder="What is the main topic discussed in the documents?",
            height=100,
            key="question_input"
        )
        
        col1, col2 = st.columns([1, 5])
        with col1:
            ask_button = st.button("🔍 Ask", type="primary", use_container_width=True)
        with col2:
            if st.button("Clear", use_container_width=True):
                st.rerun()
        
        # Process query
        if ask_button and question:
            with st.spinner("Searching documents and generating answer..."):
                result = query_documents(question, top_k=top_k)
            
            if result and result.get("success"):
                # Display answer
                st.subheader("Answer")
                st.markdown(f"**{result['answer']}**")
                
                # Display sources
                if result.get("sources"):
                    st.subheader("📚 Sources")
                    st.caption(f"Retrieved from {len(result['sources'])} source(s)")
                    
                    for i, source in enumerate(result["sources"], 1):
                        with st.expander(f"Source {i}: {source['source']}", expanded=(i == 1)):
                            col1, col2 = st.columns(2)
                            with col1:
                                if source.get('page'):
                                    st.write(f"**Page:** {source['page']}")
                            with col2:
                                st.write(f"**Relevance Score:** {source['score']:.2%}")
                
                # Display metadata
                if result.get("metadata"):
                    with st.expander("🔍 Query Details"):
                        meta = result["metadata"]
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Chunks Retrieved", meta.get("retrieved_chunks", 0))
                        with col2:
                            st.metric("LLM Tokens", meta.get("llm_tokens", 0))
                        with col3:
                            elapsed = meta.get("elapsed_time", 0)
                            st.metric("Response Time", f"{elapsed:.2f}s")
        
        elif ask_button and not question:
            st.warning("Please enter a question.")
    
    # Tab 2: Upload Interface
    with tab2:
        st.header("Upload Documents")
        
        st.info("📝 Supported formats: PDF, TXT, DOCX (max 50 MB)")
        
        # File uploader
        uploaded_file = st.file_uploader(
            "Choose a file",
            type=["pdf", "txt", "docx"],
            help="Upload a document to add to the knowledge base"
        )
        
        if uploaded_file is not None:
            # Display file info
            st.write("**File Details:**")
            col1, col2 = st.columns(2)
            with col1:
                st.write(f"📄 **Name:** {uploaded_file.name}")
            with col2:
                size_mb = uploaded_file.size / (1024 * 1024)
                st.write(f"📊 **Size:** {size_mb:.2f} MB")
            
            # Upload button
            if st.button("📤 Upload and Process", type="primary"):
                if size_mb > 50:
                    st.error("File size exceeds 50 MB limit.")
                else:
                    with st.spinner("Uploading and processing document... This may take a minute."):
                        progress_bar = st.progress(0)
                        
                        # Simulate progress (actual upload happens in one call)
                        for i in range(30):
                            time.sleep(0.05)
                            progress_bar.progress(i / 100)
                        
                        result = upload_document(uploaded_file)
                        
                        progress_bar.progress(100)
                    
                    if result and result.get("success"):
                        st.markdown(f"""
                            <div class="success-box">
                                <strong>✅ Success!</strong><br>
                                {result['message']}<br>
                                <strong>Chunks created:</strong> {result['chunks_created']}<br>
                                <strong>Document ID:</strong> {result['document_id']}
                            </div>
                        """, unsafe_allow_html=True)
                        
                        # Show metadata if available
                        if result.get("metadata"):
                            with st.expander("📊 Processing Details"):
                                meta = result["metadata"]
                                st.json(meta)
                        
                        st.balloons()
                        time.sleep(2)
                        st.rerun()
    
    # Footer
    st.divider()
    st.caption("Built with ❤️ using FastAPI, LangChain, FAISS, and OpenAI | Production-Ready RAG System")


if __name__ == "__main__":
    main()
