package main

import (
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

var requestCounter int64 = 0

// API 요청을 시뮬레이션하는 함수
func simulateAPICall(requestID int64, requestTime time.Time) string {
	time.Sleep(10 * time.Second)
	return fmt.Sprintf("Response for request %d, started at %s, completed at %s",
		requestID, requestTime.Format(time.RFC3339), time.Now().Format(time.RFC3339))
}

// 요청을 처리하는 함수
func handleRequest(requestID int64, requestTime time.Time, wg *sync.WaitGroup, resultChan chan<- string) {
	defer wg.Done()
	result := simulateAPICall(requestID, requestTime)
	resultChan <- result
}

// 단일 엔드포인트 핸들러
func requestHandler(w http.ResponseWriter, r *http.Request) {
	requestID := atomic.AddInt64(&requestCounter, 1)
	requestTime := time.Now()
	fmt.Println("requtested requestID :", requestID)

	resultChan := make(chan string)
	var wg sync.WaitGroup

	wg.Add(1)
	go handleRequest(requestID, requestTime, &wg, resultChan)

	go func() {
		wg.Wait()
		close(resultChan)
	}()

	result := <-resultChan
	fmt.Fprintf(w, result)
}

func main() {
	http.HandleFunc("/request", requestHandler)

	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}
