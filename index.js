const express = require('express')
const app = express()
const port = 3000
const data = require('./constants.json');
const ObjectsToCsv = require('objects-to-csv');


app.get('/', async (req, res) => {
    class Node {
        constructor(val, priority) {
          this.val = val;
          this.priority = priority;
        }
      }
      
      class PriorityQueue {
        constructor() {
          this.values = [];
        }
        enqueue(val, priority) {
          let newNode = new Node(val, priority);
          this.values.push(newNode);
          this.bubbleUp();
        }
        bubbleUp() {
          let idx = this.values.length - 1;
          const element = this.values[idx];
          while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.values[parentIdx];
            if (element.priority >= parent.priority) break;
            this.values[parentIdx] = element;
            this.values[idx] = parent;
            idx = parentIdx;
          }
        }
        dequeue() {
          const min = this.values[0];
          const end = this.values.pop();
          if (this.values.length > 0) {
            this.values[0] = end;
            this.sinkDown();
          }
          return min;
        }
        sinkDown() {
          let idx = 0;
          const length = this.values.length;
          const element = this.values[0];
          while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;
      
            if (leftChildIdx < length) {
              leftChild = this.values[leftChildIdx];
              if (leftChild.priority < element.priority) {
                swap = leftChildIdx;
              }
            }
            if (rightChildIdx < length) {
              rightChild = this.values[rightChildIdx];
              if (
                (swap === null && rightChild.priority < element.priority) ||
                (swap !== null && rightChild.priority < leftChild.priority)
              ) {
                swap = rightChildIdx;
              }
            }
            if (swap === null) break;
            this.values[idx] = this.values[swap];
            this.values[swap] = element;
            idx = swap;
          }
        }
      }
      
      //Dijkstra's algorithm only works on a weighted graph.
      
      class WeightedGraph {
        constructor() {
          this.adjacencyList = {};
        }
        addVertex(vertex) {
          if (!this.adjacencyList[vertex]) { 
            this.adjacencyList[vertex] = [];
          }
        }
        addEdge(vertex1, vertex2, weight) {
        if (!this.adjacencyList[vertex1]) {
            if (!this.adjacencyList[vertex2]) {
                graph.addVertex(!this.adjacencyList[vertex2]);
                this.adjacencyList[vertex2].push({ node: vertex1, weight });
                return;
            }
            graph.addVertex(!this.adjacencyList[vertex1]);
            this.adjacencyList[vertex2].push({ node: vertex1, weight });
        }
          this.adjacencyList[vertex1].push({ node: vertex2, weight });
        }
        Dijkstra(start, finish) {
          const nodes = new PriorityQueue();
          const distances = {};
          const previous = {};
          let path = []; //to return at end
          let smallest;
          //build up initial state
          for (let vertex in this.adjacencyList) {
            if (vertex === start) {
              distances[vertex] = 0;
              nodes.enqueue(vertex, 0);
            } else {
              distances[vertex] = Infinity;
              nodes.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
          }
          // as long as there is something to visit
          while (nodes.values.length) {
            smallest = nodes.dequeue().val;
            if (smallest === finish) {
              //WE ARE DONE
              //BUILD UP PATH TO RETURN AT END
              while (previous[smallest]) {
                path.push(smallest);
                smallest = previous[smallest];
              }
              break;
            }
            if (smallest || distances[smallest] !== Infinity) {
              for (let neighbor in this.adjacencyList[smallest]) {
                //find neighboring node
                let nextNode = this.adjacencyList[smallest][neighbor];
                //calculate new distance to neighboring node
                let candidate = distances[smallest] + nextNode.weight;
                let nextNeighbor = nextNode.node;
                if (candidate < distances[nextNeighbor]) {
                  //updating new smallest distance to neighbor
                  distances[nextNeighbor] = candidate;
                  //updating previous - How we got to neighbor
                  previous[nextNeighbor] = smallest;
                  //enqueue in priority queue with new priority
                  nodes.enqueue(nextNeighbor, candidate);
                }
              }
            }
          }
          return path.concat(smallest).reverse();
        }
      }
      
    let index = 0
      var graph = new WeightedGraph();
      while (index < data.length) {
        graph.addVertex(data[index].fromCurrencyCode);
        index ++;  
      }
      index = 0;
      while (index < data.length) {
        graph.addEdge(data[index].fromCurrencyCode, data[index].toCurrencyCode, data[index].exchangeRate);
        index ++;  
      }
      
      const results = graph.Dijkstra("CAD", "HKD");


      const objects = [];
      let indexs = 0
      while (indexs < results.length) {
        objects.push(reformObject(results[index]))
        indexs++
      }
      await convertToCSV(results);

})
const reformObject = (exData = 'CAD') => {
  let someData = data.filter(data => {
    return data.fromCurrencyCode === exData
  })
  console.log(someData);
}
const convertToCSV = async (data) => {
    const csv = new ObjectsToCsv(data);
    await csv.toDisk('./bestRoute.csv');
    console.log(await csv.toString());
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})