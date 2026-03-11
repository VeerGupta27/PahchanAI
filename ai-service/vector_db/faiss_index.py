import faiss
import numpy as np
import os

EMBEDDING_FOLDER = "embeddings"

dimension = 512

index = faiss.IndexFlatL2(dimension)

labels = []


def load_embeddings():

    for file in os.listdir(EMBEDDING_FOLDER):

        if file.endswith(".npy"):

            path = os.path.join(EMBEDDING_FOLDER, file)

            embedding = np.load(path)

            index.add(np.array([embedding]).astype('float32'))

            labels.append(file.split(".")[0])

    print("Embeddings loaded:", len(labels))


def search_face(query_embedding):

    query_embedding = np.array([query_embedding]).astype('float32')

    distance, index_id = index.search(query_embedding, 1)

    match_label = labels[index_id[0][0]]
    match_distance = distance[0][0]

    return match_label, match_distance


if __name__ == "__main__":

    load_embeddings()

    print("FAISS index ready")